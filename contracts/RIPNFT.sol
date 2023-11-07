// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Burnable.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract RIPNFT is ERC1155, Ownable,  ERC1155Burnable, ERC1155Supply {
    constructor(address _daiTokenAddress, string memory uri) ERC1155(uri) {
        daiTokenAddress = _daiTokenAddress;
        admin = msg.sender;
    }

    IERC20 daiToken = IERC20(daiTokenAddress);
    

//OpenZeppelin implementation functions
    function setURI(string memory newuri) public onlyOwner {
        _setURI(newuri);
    }

    function setTokenURI(uint256 _eventID, string memory tokenURI) internal {
        require(msg.sender == events[_eventID].Creator , "Event has ended");
        _tokenURIs[_eventID] = tokenURI;
    }

   // Override the _uri function to return the correct URI based on the event ID
    function uri(uint256 _eventID) 
        public 
        view 
        override 
        returns (string memory) 
   {
        require(_exists(_eventID), "ERC1155Metadata: URI query for nonexistent token");

        // If a specific URI is set for the token ID, return that URI
        if (bytes(_tokenURIs[_eventID]).length > 0) {
            return _tokenURIs[_eventID];
        } else {
            // If no specific URI is set, fall back to the default URI
            return super.uri(tokenId);
        }
    }

    function mint(address account, uint256 id, uint256 amount, bytes memory data)
        public
        onlyOwner
    {
        _mint(account, id, amount, data);
    }

    function mintBatch(address to, uint256[] memory ids, uint256[] memory amounts, bytes memory data)
        public
        onlyOwner
    {
        _mintBatch(to, ids, amounts, data);
    }

    // The following functions are overrides required by Solidity.

    function _beforeTokenTransfer(address operator, address from, address to, uint256[] memory ids, uint256[] memory amounts, bytes memory data)
        internal
        override(ERC1155, ERC1155Supply)
    {
        super._beforeTokenTransfer(operator, from, to, ids, amounts, data);
    }

//Variables
    address public minterContract;
    address public admin;
    uint256 public adminBalance;
    uint256 conversion = 1;
    address public daiTokenAddress;  // Address of the DAI token contract
    uint256 eventCounter = 1; //Token 0 is FCoin
    mapping(uint256 => string) private _tokenURIs; //URIs of each event

    struct Event {
        string Name;
        address Creator;
        uint256 Duration;
        uint256 StartTime;
        bool HasEnded;
        string NFTURI;
        uint256 FCoins;
        address[] Supporters;
        uint256 MinimumTip; 
    }

    mapping(uint256 => Event) public events; // tracks event by ID
    mapping(uint256 => mapping(address => bool)) public hasMinted;


    //Events
    event BuyFCoin(address payer, uint256 amount);
    event EventStarted(uint256 ID, address indexed creator, uint256 duration);
    event EventEnded(uint256 ID, address indexed creator, uint256 amount);

    //Modifiers

    modifier onlySupporter(uint256 _eventID) {
        bool isSupporter = false;
        for (uint256 i = 0; i < events[_eventID].Supporters.length; i++) {
            if (events[_eventID].Supporters[i] == msg.sender) {
                isSupporter = true;
                break;
            }
        }
        require(isSupporter, "You are not a member.");
        _;
    }

    //Main Logic
    function getFcoins(uint256 _amount) external {
        uint256 DAI = _amount * conversion;
        // Transfer DAI tokens from the payer to this contract
        bool success = daiToken.transferFrom(msg.sender, address(this), DAI);
        require(success, "Failed to receive DAI payment");
        mint(msg.sender, 0, _amount, "");
        emit BuyFCoin(msg.sender, _amount);
    }
    
    function startEvent(string calldata _Name, string calldata _NFTURI, uint256 _minutes, uint256 _MinimumTip) external {
        require(_minutes <= 10080, "Maximum duration is 1 week");
        require(_MinimumTip > 0, "Amount to participate must be larger than 0");
        uint256 _thisEvent = eventCounter;
        events[_thisEvent].Name = _Name;
        events[_thisEvent].NFTURI = _NFTURI;
        events[_thisEvent].Duration = _minutes;
        events[_thisEvent].Creator = msg.sender;
        events[_thisEvent].StartTime = block.timestamp;
        events[_thisEvent].MinimumTip = _MinimumTip;
        eventCounter = eventCounter + 1;
        emit EventStarted(_thisEvent, msg.sender, _minutes);
    }

    function payRespects(uint256 _eventID, uint256 _amount) external {
        require(block.timestamp < events[_eventID].StartTime + (events[_eventID].Duration * 60), "The time to pay respects has ended");
        require(events[_eventID].HasEnded == false, "Event has ended");
        require(_amount >=  events[_eventID].MinimumTip, "Tip is not large enough");
        safeTransferFrom(msg.sender, address(this), 0, _amount, "0x0");
        events[_eventID].FCoins = events[_eventID].FCoins + _amount;
        events[_eventID].Supporters.push(msg.sender);
    }

    function endEvent(uint256 _eventID) external {
        require(block.timestamp >= events[_eventID].StartTime + (events[_eventID].Duration * 60), "The event is still ongoing");
        require(events[_eventID].HasEnded == false, "Event has ended");
        events[_eventID].HasEnded == true;
        uint256 DAI = (events[_eventID].FCoins  * 97) / conversion / 100;
        adminBalance = (events[_eventID].FCoins / conversion) - DAI;
        burn(address(this), 0, events[_eventID].FCoins);
        bool success = daiToken.transferFrom(address(this), events[_eventID].Creator, DAI);
        require(success, "Failed to send DAI payment");
        mint(events[_eventID].Creator, _eventID, 1, "");
        emit EventEnded(_eventID ,events[_eventID].Creator, events[_eventID].FCoins);
    }

    function mintNFT(uint256 _eventID) external onlySupporter(_eventID) {
        require(events[_eventID].HasEnded == true, "The event is still ongoing");
        require(hasMinted[_eventID][msg.sender] == false, "You have already minted your NFT");
        mint(msg.sender, _eventID, 1, "0x0");
        hasMinted[_eventID][msg.sender] = true;
    }

    function take profits() external onlyOwner {
        uint256 DAI = adminBalance;
        bool success = daiToken.transferFrom(address(this), msg.sender, DAI);
        require(success, "Failed to send DAI payment");
    }

}
