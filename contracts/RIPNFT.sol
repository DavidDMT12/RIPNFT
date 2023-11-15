// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Burnable.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155Receiver.sol";

contract RIPNFT is ERC1155, Ownable,  ERC1155Burnable, ERC1155Supply, IERC1155Receiver {
    constructor(address _daiTokenAddress, string memory uri) ERC1155(uri) Ownable(msg.sender) {
        daiTokenAddress = _daiTokenAddress;
    }

    IERC20 daiToken = IERC20(daiTokenAddress);
    

//OpenZeppelin implementation functions
    function setURI(string memory newuri) public onlyOwner {
        _setURI(newuri);
    }

    function setTokenURI(uint256 _eventID, string memory tokenURI) internal {
        _tokenURIs[_eventID] = tokenURI;
    }

   // Override the _uri function to return the correct URI based on the event ID
    function uri(uint256 _eventID) 
        public 
        view 
        override 
        returns (string memory) 
   {
        //require(exists(_eventID), "ERC1155Metadata: URI query for nonexistent token");

        // If a specific URI is set for the token ID, return that URI
        if (bytes(_tokenURIs[_eventID]).length > 0) {
            return _tokenURIs[_eventID];
        } else {
            // If no specific URI is set, fall back to the default URI
            return super.uri(_eventID);
        }
    }

    function mint(address account, uint256 id, uint256 amount, bytes memory data)
        internal    
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

    function _update(address from, address to, uint256[] memory ids, uint256[] memory values)
        internal
        override(ERC1155, ERC1155Supply)
    {
        super._update(from, to, ids, values);
    }

    function onERC1155Received(
        address operator,
        address from,
        uint256 id,
        uint256 value,
        bytes calldata data
    ) public override returns (bytes4) {
        require(id == 0, "This contract does not support NFT receivals");
        
        // Return ERC1155 receiver function signature
        return this.onERC1155Received.selector;
    }

    function onERC1155BatchReceived(
        address operator,
        address from,
        uint256[] calldata ids,
        uint256[] calldata values,
        bytes calldata data
    ) public override returns (bytes4) {
       require(ids.length == 1 && values.length == 1 && ids[0] == 0, "This contract only supports NFT receivals");
        
        // Return ERC1155 receiver function signature
        return this.onERC1155BatchReceived.selector;
    }

//Variables
    uint256 public adminBalance;
    uint256 conversion = 1;
    address public daiTokenAddress;  // Address of the DAI token contract
    uint256 eventCounter = 1; //Token 0 is FCoin
    mapping(uint256 => string) public _tokenURIs; //URIs of each event
    mapping(address => uint256) public creatorCut;
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
        bool success = IERC20(daiTokenAddress).transferFrom(msg.sender,address(this), DAI);
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
        setTokenURI(_thisEvent, _NFTURI);
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
        events[_eventID].HasEnded = true;
        uint256 DAI = (events[_eventID].FCoins * 97) / conversion / 100;
        uint256 total = (events[_eventID].FCoins / conversion);
        adminBalance =  total - DAI;
    
    // Assign the DAI amount to the creator's cut
        creatorCut[events[_eventID].Creator] = creatorCut[events[_eventID].Creator] + DAI;
    
        _burn(address(this), 0, events[_eventID].FCoins);
        mint(events[_eventID].Creator, _eventID, 1, "");
        emit EventEnded(_eventID, events[_eventID].Creator, events[_eventID].FCoins);
    }

    function claimDAI() external {
        uint256 DAI = creatorCut[msg.sender];
        creatorCut[msg.sender] = 0;  // Reset the creator's cut after claiming
    
        bool success = IERC20(daiTokenAddress).transfer(msg.sender, DAI);
        require(success, "Failed to send DAI payment");
    }

    function mintNFT(uint256 _eventID) external onlySupporter(_eventID) {
        require(events[_eventID].HasEnded == true, "The event is still ongoing");
        require(hasMinted[_eventID][msg.sender] == false, "You have already minted your NFT");
        mint(msg.sender, _eventID, 1, "0x0");
        hasMinted[_eventID][msg.sender] = true;
    }

    function takeprofits() external onlyOwner {
        uint256 DAI = adminBalance;
        adminBalance = 0;
        bool success = IERC20(daiTokenAddress).transfer(msg.sender, DAI);
        require(success, "Failed to send DAI payment");
    }
}
