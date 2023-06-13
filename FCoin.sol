// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/draft-ERC20Permit.sol";

contract FCOIN is ERC20, ERC20Burnable, Ownable, ERC20Permit {

    constructor(address _daiTokenAddress, address _minterContract) ERC20("FCOIN", "FCN") ERC20Permit("FCOIN") {
        daiTokenAddress = _daiTokenAddress;
        admin = msg.sender;
        minterContract = _minterContract;
    }

    ERC20 daiToken = ERC20(daiTokenAddress);

    //Variables
    address public minterContract;
    address public admin;
    uint256 public adminBalance;
    uint256 conversion = 1;
    address public daiTokenAddress;  // Address of the DAI token contract
    uint256 eventCounter;

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


    //Events
    event BuyFCoin(address payer, uint256 amount);
    event EventStarted(uint256 ID, address indexed creator, uint256 duration);
    event EventEnded(uint256 ID, address indexed creator, uint256 amount);

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
        uint256 DAI = _amount * conversion;
        // Transfer DAI tokens from the payer to this contract
        bool success = daiToken.transferFrom(msg.sender, address(this), DAI);
        require(success, "Failed to receive DAI payment");
        mint(msg.sender, _amount);
        emit BuyFCoin(msg.sender, _amount);
    }
    
    function startEvent(string calldata _Name, string calldata _NFTURI, uint256 _minutes, uint256 _MinimumTip) external {
        require(_minutes <= 10080, "Maximum duration is 1 week");
        require(_MinimumTip >0, "Amount to participate must be larger than 0");
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
        transfer(address(this), _amount);
        events[_eventID].FCoins = events[_eventID].FCoins + _amount;
        events[_eventID].Supporters.push(msg.sender);
    }

    function endEvent(uint256 _eventID) external {
        require(block.timestamp >= events[_eventID].StartTime + (events[_eventID].Duration * 60), "The event is still ongoing");
        require(events[_eventID].HasEnded == false, "Event has ended");
        events[_eventID].HasEnded == true;
        uint256 DAI = (events[_eventID].FCoins  * 97) / conversion / 100;
        adminBalance = DAI - events[_eventID].FCoins;
        burn(events[_eventID].FCoins);
        bool success = daiToken.transferFrom(address(this), msg.sender, DAI);
        require(success, "Failed to send DAI payment");
        emit EventEnded(_eventID ,events[_eventID].Creator, events[_eventID].FCoins);
    }

    function redeem() external onlyOwner {
        uint256 DAI = adminBalance;
        bool success = daiToken.transferFrom(address(this), msg.sender, DAI);
        require(success, "Failed to send DAI payment");
    }

}
