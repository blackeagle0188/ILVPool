// SPDX-License-Identifier: MIT
pragma solidity ^0.8.1;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @dev Interface of the ERC20 standard as defined in the EIP.
 */
interface IERC20 {
  /**
   * @dev Returns the amount of tokens in existence.
   */
  function totalSupply() external view returns (uint256);

  /**
   * @dev Returns the token decimals.
   */
  function decimals() external view returns (uint8);

  /**
   * @dev Returns the token symbol.
   */
  function symbol() external view returns (string memory);

  /**
  * @dev Returns the token name.
  */
  function name() external view returns (string memory);

  /**
   * @dev Returns the erc token owner.
   */
  function getOwner() external view returns (address);

  /**
   * @dev Returns the amount of tokens owned by `account`.
   */
  function balanceOf(address account) external view returns (uint256);

  /**
   * @dev Moves `amount` tokens from the caller's account to `recipient`.
   *
   * Returns a boolean value indicating whether the operation succeeded.
   *
   * Emits a {Transfer} event.
   */
  function transfer(address recipient, uint256 amount) external returns (bool);

  /**
   * @dev Returns the remaining number of tokens that `spender` will be
   * allowed to spend on behalf of `owner` through {transferFrom}. This is
   * zero by default.
   *
   * This value changes when {approve} or {transferFrom} are called.
   */
  function allowance(address _owner, address spender) external view returns (uint256);

  /**
   * @dev Sets `amount` as the allowance of `spender` over the caller's tokens.
   *
   * Returns a boolean value indicating whether the operation succeeded.
   *
   * IMPORTANT: Beware that changing an allowance with this method brings the risk
   * that someone may use both the old and the new allowance by unfortunate
   * transaction ordering. One possible solution to mitigate this race
   * condition is to first reduce the spender's allowance to 0 and set the
   * desired value afterwards:
   * https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
   *
   * Emits an {Approval} event.
   */
  function approve(address spender, uint256 amount) external returns (bool);

  /**
   * @dev Moves `amount` tokens from `sender` to `recipient` using the
   * allowance mechanism. `amount` is then deducted from the caller's
   * allowance.
   *
   * Returns a boolean value indicating whether the operation succeeded.
   *
   * Emits a {Transfer} event.
   */
  function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);

  /**
   * @dev Emitted when `value` tokens are moved from one account (`from`) to
   * another (`to`).
   *
   * Note that `value` may be zero.
   */
  event Transfer(address indexed from, address indexed to, uint256 value);

  /**
   * @dev Emitted when the allowance of a `spender` for an `owner` is set by
   * a call to {approve}. `value` is the new allowance.
   */
  event Approval(address indexed owner, address indexed spender, uint256 value);
}

/**
 * @title SafeERC20
 * @dev Wrappers around ERC20 operations that throw on failure (when the token
 * contract returns false). Tokens that return no value (and instead revert or
 * throw on failure) are also supported, non-reverting calls are assumed to be
 * successful.
 * To use this library you can add a `using SafeERC20 for IERC20;` statement to your contract,
 * which allows you to call the safe operations as `token.safeTransfer(...)`, etc.
 */
library SafeERC20 {
    using SafeMath for uint256;
    using Address for address;

    function safeTransfer(IERC20 token, address to, uint256 value) internal {
        _callOptionalReturn(token, abi.encodeWithSelector(token.transfer.selector, to, value));
    }

    function safeTransferFrom(IERC20 token, address from, address to, uint256 value) internal {
        _callOptionalReturn(token, abi.encodeWithSelector(token.transferFrom.selector, from, to, value));
    }

    /**
     * @dev Deprecated. This function has issues similar to the ones found in
     * {IERC20-approve}, and its usage is discouraged.
     *
     * Whenever possible, use {safeIncreaseAllowance} and
     * {safeDecreaseAllowance} instead.
     */
    function safeApprove(IERC20 token, address spender, uint256 value) internal {
        // safeApprove should only be called when setting an initial allowance,
        // or when resetting it to zero. To increase and decrease it, use
        // 'safeIncreaseAllowance' and 'safeDecreaseAllowance'
        // solhint-disable-next-line max-line-length
        require((value == 0) || (token.allowance(address(this), spender) == 0),
            "SafeERC20: approve from non-zero to non-zero allowance"
        );
        _callOptionalReturn(token, abi.encodeWithSelector(token.approve.selector, spender, value));
    }

    function safeIncreaseAllowance(IERC20 token, address spender, uint256 value) internal {
        uint256 newAllowance = token.allowance(address(this), spender).add(value);
        _callOptionalReturn(token, abi.encodeWithSelector(token.approve.selector, spender, newAllowance));
    }

    function safeDecreaseAllowance(IERC20 token, address spender, uint256 value) internal {
        uint256 newAllowance = token.allowance(address(this), spender).sub(value, "SafeERC20: decreased allowance below zero");
        _callOptionalReturn(token, abi.encodeWithSelector(token.approve.selector, spender, newAllowance));
    }

    /**
     * @dev Imitates a Solidity high-level call (i.e. a regular function call to a contract), relaxing the requirement
     * on the return value: the return value is optional (but if data is returned, it must not be false).
     * @param token The token targeted by the call.
     * @param data The call data (encoded using abi.encode or one of its variants).
     */
    function _callOptionalReturn(IERC20 token, bytes memory data) private {
        // We need to perform a low level call here, to bypass Solidity's return data size checking mechanism, since
        // we're implementing it ourselves. We use {Address.functionCall} to perform this call, which verifies that
        // the target address contains contract code and also asserts for success in the low-level call.

        bytes memory returndata = address(token).functionCall(data, "SafeERC20: low-level call failed");
        if (returndata.length > 0) { // Return data is optional
            // solhint-disable-next-line max-line-length
            require(abi.decode(returndata, (bool)), "SafeERC20: ERC20 operation did not succeed");
        }
    }
}

contract Staking is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;
    using SafeMath for uint256;

    // Info of each user.
    struct UserInfo {
        address owner;
        uint256 amount;     // How many tokens the user has provided.
        uint256 lockPeriod; 
        uint256 depositTime;
    }

    // Info of pool.
    struct PoolInfo {
        IERC20 stakeToken;              // Address of token contract.
        IERC20 rewardToken;
        uint256 totalDeposits;    // Total tokens deposited in the pool.
    }

    // Token reward created per day.
    uint256 public immutable rewardPerDay;

    // Info of pool.
    PoolInfo public poolInfo;

    // Info of each user that stakes ILV Tokens.
    mapping (address => UserInfo[]) public userInfo;

    event Deposit(address indexed user, uint256 amount);
    event Withdraw(address indexed user, uint256 amount);
    event RewardPaid(address indexed user, uint256 reward);

    constructor(
        IERC20 _stakeToken, //token which will be staked
        IERC20 _rewardToken, //token which will be a reward for staking
        uint256 _rewardPerDay //reward percent perday
    ) {
        rewardPerDay = _rewardPerDay;

        // staking pool
        poolInfo = PoolInfo({
            stakeToken: _stakeToken,
            rewardToken: _rewardToken,
            totalDeposits: 0
        });
    }

    // View function to see pending Reward.
    function pendingReward(address _user, uint256 _stakeId) public view returns (uint256) {
        UserInfo storage user = userInfo[_user][_stakeId];
        uint256 period = block.timestamp - user.depositTime;
        if(period > user.lockPeriod) {
            period = user.lockPeriod;
        }
        uint256 totalReward = period.mul(1e12).div(3600).div(24).mul(rewardPerDay);
        return user.amount.mul(totalReward).div(1e12).div(100);
    }

    // Stake StakeToken
    function deposit(uint256 _amount, uint256 _lockPeriod) public nonReentrant {
        require(_amount > 0, "Staking: Amount must be > 0");

        PoolInfo storage pool = poolInfo;        
        UserInfo memory newDeposit;
        
        pool.stakeToken.safeTransferFrom(address(msg.sender), address(this), _amount);
        pool.totalDeposits = pool.totalDeposits.add(_amount);

        newDeposit.owner = msg.sender;
        newDeposit.amount = _amount;
        newDeposit.lockPeriod = _lockPeriod * 1 days;
        newDeposit.depositTime = block.timestamp;
        userInfo[msg.sender].push(newDeposit);

        emit Deposit(msg.sender, _amount);
    }

    // Withdraw StakeToken tokens
    function withdraw(uint256 _stakeId) public nonReentrant {
        PoolInfo storage pool = poolInfo;
        UserInfo memory user = userInfo[msg.sender][_stakeId];
        require((block.timestamp - user.depositTime) > user.lockPeriod, "Withdraw is locked");
        require(msg.sender == user.owner, "You are not allowed to unstake.");
        pool.rewardToken.safeTransfer(address(msg.sender), user.amount);
        pool.totalDeposits = pool.totalDeposits.sub(user.amount);

        emit Withdraw(msg.sender, user.amount);
    }

    //Withdraw remained tokens in staking contract, For only owner
    function withdrawRewardToken(uint256 _amount) public nonReentrant onlyOwner {
        PoolInfo storage pool = poolInfo;
        uint256 rewardPoolBalance = pool.rewardToken.balanceOf(address(this));
        require(rewardPoolBalance >= _amount, "Insufficient balance");
        pool.rewardToken.safeTransfer(address(this), _amount);
    }

    //Claim reward tokens
    function claim(uint256 _stakeId) public nonReentrant {
        PoolInfo storage pool = poolInfo;
        UserInfo memory user = userInfo[msg.sender][_stakeId];
        require((block.timestamp - user.depositTime) > user.lockPeriod, "Withdraw is locked");
        require(msg.sender == user.owner, "You are not allowed to claim.");
        uint256 pending = pendingReward(msg.sender, _stakeId);
        if(pending > 0) {
            pool.rewardToken.safeTransfer(address(msg.sender), pending);
            emit RewardPaid(msg.sender, pending);
        }
    }

    //View function to check if reward is claimable
    function getStakeClaimable(address _user, uint256 _stakeId) public view returns(bool) {
        UserInfo memory user = userInfo[_user][_stakeId];
        uint256 period = block.timestamp - user.depositTime;
        if(period > user.lockPeriod) {
            return true;
        } else {
            return false;
        }
    }

    //View function to see staking information by address
    function getStakeInfoByAddress(address _user) public view returns(UserInfo[] memory){
        return userInfo[_user];
    }
}