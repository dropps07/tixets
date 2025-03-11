// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";


contract Tixets is Ownable, ReentrancyGuard {
    struct Event {
        uint256 id;
        string name;
        string description;
        uint256 date;
        uint256 price;
        uint256 totalTickets;
        uint256 ticketsSold;
        bool isActive;
    }

    struct UserProfile {
        string username;
        string bio;
        string linkedin;
        string github;
        bool isRegistered;
    }

    mapping(uint256 => Event) public events;
    mapping(address => mapping(uint256 => uint256)) public ticketsPurchased;
    mapping(address => UserProfile) public userProfiles;
    mapping(string => bool) public usernameExists;

    uint256 public nextEventId = 1;

    event EventCreated(uint256 indexed eventId, string name, string description, uint256 date, uint256 price, uint256 totalTickets);
    event TicketPurchased(uint256 indexed eventId, address indexed buyer, uint256 quantity);
    event TicketValidated(uint256 indexed eventId, address indexed attendee);
    event UserRegistered(address indexed userAddress, string username);
    event UserProfileUpdated(address indexed userAddress, string username, string bio, string linkedin, string github);

    constructor() Ownable(msg.sender) {}

    function createEvent(string memory _name, string memory _description, uint256 _date, uint256 _price, uint256 _totalTickets) external onlyOwner {
        require(_date > block.timestamp, "Event date must be in the future");
        require(_totalTickets > 0, "Total tickets must be greater than zero");

        events[nextEventId] = Event(nextEventId, _name, _description, _date, _price, _totalTickets, 0, true);
        emit EventCreated(nextEventId, _name, _description, _date, _price, _totalTickets);
        nextEventId++;
    }

    function purchaseTicket(uint256 _eventId, uint256 _quantity) external payable nonReentrant {
        Event storage event_ = events[_eventId];
        require(event_.isActive, "Event is not active");
        require(block.timestamp < event_.date, "Event has already occurred");
        require(event_.ticketsSold + _quantity <= event_.totalTickets, "Not enough tickets available");
        require(msg.value >= event_.price * _quantity, "Insufficient payment");

        event_.ticketsSold += _quantity;
        ticketsPurchased[msg.sender][_eventId] += _quantity;

        emit TicketPurchased(_eventId, msg.sender, _quantity);

        if (msg.value > event_.price * _quantity) {
            payable(msg.sender).transfer(msg.value - (event_.price * _quantity));
        }
    }

    function validateTicket(uint256 _eventId, address _attendee) external onlyOwner {
        require(ticketsPurchased[_attendee][_eventId] > 0, "No valid ticket found");
        require(block.timestamp >= events[_eventId].date, "Event has not started yet");

        ticketsPurchased[_attendee][_eventId]--;
        emit TicketValidated(_eventId, _attendee);
    }

    function registerUser(string memory _username) external {
        require(!userProfiles[msg.sender].isRegistered, "User already registered");
        require(!usernameExists[_username], "Username already taken");

        userProfiles[msg.sender] = UserProfile(_username, "", "", "", true);
        usernameExists[_username] = true;

        emit UserRegistered(msg.sender, _username);
    }

    function updateUserProfile(string memory _bio, string memory _linkedin, string memory _github) external {
        require(userProfiles[msg.sender].isRegistered, "User not registered");

        UserProfile storage profile = userProfiles[msg.sender];
        profile.bio = _bio;
        profile.linkedin = _linkedin;
        profile.github = _github;

        emit UserProfileUpdated(msg.sender, profile.username, _bio, _linkedin, _github);
    }

    function getEvent(uint256 _eventId) external view returns (Event memory) {
        return events[_eventId];
    }

    function getUserTickets(uint256 _eventId) external view returns (uint256) {
        return ticketsPurchased[msg.sender][_eventId];
    }

    function getUserProfile(address _userAddress) external view returns (UserProfile memory) {
        return userProfiles[_userAddress];
    }

    function withdrawFunds() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}
