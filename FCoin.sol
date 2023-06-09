pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/draft-ERC20Permit.sol";

contract FCOIN is ERC20, ERC20Burnable, Ownable, ERC20Permit {

    constructor(address _daiTokenAddress) ERC20("FCOIN", "FCN") ERC20Permit("FCOIN") {
        daiTokenAddress = _daiTokenAddress;
    }

    //Variables
    uint256 public admin;
    uint256 public adminBalance;
    mapping(address => uint256) public payedRespects;
    uint256 conversion = 5;
    address public daiTokenAddress;  // Address of the DAI token contract
    uint256 eventCounter;

    struct Event {
        string Name;
        address Owner;
        uint256 Duration;
        uint256 StartTime;
        bool HasEnded;
        string NFT;
        uint256 FCoins;
        address[] Supporters; 
    }

    mapping(uint256 => Event) public events; // tracks event by ID

    //Events
    event BuyFCoin(address payer, uint256 amount);
    event EventStarted(uint256 ID, address indexed creator, uint duration);

    //Override functions
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    function burn(uint256 amount) public override onlyOwner {
        _burn(_msgSender(), amount);
    }

    function burnFrom(address account, uint256 amount) public override onlyOwner {
        _spendAllowance(account, _msgSender(), amount);
        _burn(account, amount);
    }

    //Main Logic
    function getFcoins(uint256 _amount) external {
        ERC20 daiToken = ERC20(daiTokenAddress);
        uint256 DAI = _amount * conversion;
        // Transfer DAI tokens from the payer to this contract
        bool success = daiToken.transferFrom(msg.sender, address(this), DAI);
        require(success, "Failed to receive DAI payment");
        mint(msg.sender, _amount);
        emit BuyFCoin(msg.sender, _amount);
    }
    
    function startEvent(string calldata _Name, string calldata _NFT, uint256 _minutes) external {
        require(_minutes <= 10080, "Maximum duration is 1 week");
        uint256 _thisEvent = eventCounter;
        events[_thisEvent].Name = _Name;
        events[_thisEvent].NFT = _NFT;
        events[_thisEvent].Duration = _minutes;
        events[_thisEvent].Owner = msg.sender;
        events[_thisEvent].StartTime = block.timestamp;
        eventCounter = eventCounter + 1;
        emit EventStarted(_thisEvent, msg.sender, _minutes);
    }

    function payRespects(uint256 _eventID, uint256 _amount) external {
        require(block.timestamp < events[_eventID].StartTime + (events[_eventID].Duration * 60), "The time to pay respects has ended");
        require(HasEnded == false, "Event has ended");
        transfer()
    }

}
