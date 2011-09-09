/**
 * Tencent weibo javascript library
 *
 * Locker mechanism
 *
 * @author michalliu
 * @version 1.0
 * @package core
 * @module door
 * @requires base
 */
QQWB.extend("door", {

	// count of doors
    doors:0

	/**
	 * Retrieve a new door object, the door can be locked or unlocked
	 *
	 * @access public
	 * @param optLockDo {Function} actions do when lock acts
	 * @param optUnlockDo {Function} action do when unlock acts
	 * @return {Object} locker object
	 */
   ,door: function (optLockDo, optUnlockDo) {

	    // the locks number on this door
        var locks = 0;

		// record the total number of door instance
        this.doors ++;

        return {
			/**
			 * Lock the door
			 *
			 * @access public
			 */
            lock: function () {
                locks ++;
				optLockDo && optLockDo.call(QQWB);
				return this;
            }
			/**
			 * unLock the door
			 *
			 * @access public
			 */
           ,unlock: function () {
               locks --;
			   locks = Math.max(0,locks);
			   optUnlockDo && optUnlockDo.call(QQWB);
			   return this;
            }
			/**
			 * Check whether the door instance is open
			 *
			 * @access public
			 */
           ,isOpen: function () {
               return locks === 0;
            }
        };
    }
	/**
	 * Retrieve the number of lockers
	 *
	 * @access public
	 * @return {Number} count of lockers
	 */
   ,count: function () {
       return this.doors;
    }
});
