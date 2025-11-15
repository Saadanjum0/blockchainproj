// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract Escrow is Ownable, ReentrancyGuard {
    
    struct Payment {
        uint256 orderId;
        uint256 totalAmount;
        uint256 restaurantShare;
        uint256 riderShare;
        uint256 platformFee;
        address restaurant;
        address rider;
        bool released;
        bool refunded;
    }

    mapping(uint256 => Payment) public payments;
    uint256 public platformFeeBps = 1000; // 10% = 1000 basis points
    uint256 public riderFeeBps = 1000; // 10% for rider
    address public platformWallet;
    address public orderManager;

    event FundsDeposited(uint256 indexed orderId, uint256 amount);
    event FundsReleased(
        uint256 indexed orderId,
        address restaurant,
        address rider,
        uint256 restaurantAmount,
        uint256 riderAmount,
        uint256 platformFee
    );
    event FundsRefunded(uint256 indexed orderId, address customer, uint256 amount);
    event FeesUpdated(uint256 platformFeeBps, uint256 riderFeeBps);
    event OrderManagerUpdated(address indexed newOrderManager);

    constructor(address _platformWallet) Ownable(msg.sender) {
        require(_platformWallet != address(0), "Invalid platform wallet");
        platformWallet = _platformWallet;
    }

    /**
     * @dev Set OrderManager address (must be called after deployment)
     */
    function setOrderManager(address _orderManager) external onlyOwner {
        require(_orderManager != address(0), "Invalid address");
        orderManager = _orderManager;
        emit OrderManagerUpdated(_orderManager);
    }

    /**
     * @dev Update fee structure
     */
    function setFees(uint256 _platformFeeBps, uint256 _riderFeeBps) external onlyOwner {
        require(_platformFeeBps <= 2000, "Platform fee too high"); // Max 20%
        require(_riderFeeBps <= 2000, "Rider fee too high"); // Max 20%
        require(_platformFeeBps + _riderFeeBps <= 5000, "Total fees too high"); // Max 50%
        
        platformFeeBps = _platformFeeBps;
        riderFeeBps = _riderFeeBps;
        emit FeesUpdated(_platformFeeBps, _riderFeeBps);
    }

    /**
     * @dev Update platform wallet
     */
    function setPlatformWallet(address _platformWallet) external onlyOwner {
        require(_platformWallet != address(0), "Invalid address");
        platformWallet = _platformWallet;
    }

    /**
     * @dev Deposit funds for order
     */
    function deposit(
        uint256 _orderId,
        address _restaurant,
        address _rider
    ) external payable nonReentrant {
        require(msg.sender == orderManager, "Only OrderManager");
        require(msg.value > 0, "No funds sent");
        require(_restaurant != address(0), "Invalid restaurant");
        require(payments[_orderId].orderId == 0, "Payment already exists");

        uint256 platformFee = (msg.value * platformFeeBps) / 10000;
        uint256 riderFee = (msg.value * riderFeeBps) / 10000;
        uint256 restaurantAmount = msg.value - platformFee - riderFee;

        payments[_orderId] = Payment({
            orderId: _orderId,
            totalAmount: msg.value,
            restaurantShare: restaurantAmount,
            riderShare: riderFee,
            platformFee: platformFee,
            restaurant: _restaurant,
            rider: _rider,
            released: false,
            refunded: false
        });

        emit FundsDeposited(_orderId, msg.value);
    }

    /**
     * @dev Release funds after successful delivery
     */
    function release(uint256 _orderId) external nonReentrant {
        require(msg.sender == orderManager, "Only OrderManager");
        Payment storage payment = payments[_orderId];
        require(payment.orderId != 0, "Payment not found");
        require(!payment.released, "Already released");
        require(!payment.refunded, "Already refunded");
        require(payment.totalAmount > 0, "No payment amount");

        payment.released = true;

        // Transfer to restaurant
        (bool successRestaurant, ) = payable(payment.restaurant).call{
            value: payment.restaurantShare
        }("");
        require(successRestaurant, "Restaurant transfer failed");

        // Transfer to rider (if assigned)
        if (payment.rider != address(0)) {
            (bool successRider, ) = payable(payment.rider).call{
                value: payment.riderShare
            }("");
            require(successRider, "Rider transfer failed");
        } else {
            // If no rider assigned, platform gets rider share too
            payment.platformFee += payment.riderShare;
        }

        // Transfer platform fee
        (bool successPlatform, ) = payable(platformWallet).call{
            value: payment.platformFee
        }("");
        require(successPlatform, "Platform transfer failed");

        emit FundsReleased(
            _orderId,
            payment.restaurant,
            payment.rider,
            payment.restaurantShare,
            payment.riderShare,
            payment.platformFee
        );
    }

    /**
     * @dev Refund customer (order cancelled or disputed)
     */
    function refund(uint256 _orderId, address _customer) external nonReentrant {
        require(msg.sender == orderManager, "Only OrderManager");
        Payment storage payment = payments[_orderId];
        require(payment.orderId != 0, "Payment not found");
        require(!payment.released, "Already released");
        require(!payment.refunded, "Already refunded");
        require(payment.totalAmount > 0, "No payment amount");
        require(_customer != address(0), "Invalid customer address");

        payment.refunded = true;

        (bool success, ) = payable(_customer).call{value: payment.totalAmount}("");
        require(success, "Refund failed");

        emit FundsRefunded(_orderId, _customer, payment.totalAmount);
    }

    /**
     * @dev Get payment details
     */
    function getPayment(uint256 _orderId) external view returns (Payment memory) {
        return payments[_orderId];
    }

    /**
     * @dev Get payment status
     */
    function getPaymentStatus(uint256 _orderId) external view returns (
        bool exists,
        bool released,
        bool refunded,
        uint256 amount
    ) {
        Payment memory payment = payments[_orderId];
        return (
            payment.orderId != 0,
            payment.released,
            payment.refunded,
            payment.totalAmount
        );
    }

    /**
     * @dev Emergency withdraw (only owner, only if funds stuck)
     */
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance");
        
        (bool success, ) = payable(platformWallet).call{value: balance}("");
        require(success, "Withdraw failed");
    }

    /**
     * @dev Get contract balance
     */
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
