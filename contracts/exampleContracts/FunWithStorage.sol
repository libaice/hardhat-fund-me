// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract FunWithStorage {
    uint256 private favoriteNumber; //storage slot 0
    bool private someBool; // slot 1
    uint256[] myArray; // slot 2 keccak256(2)
    mapping(uint256 => bool) myMap; // slot 3 keccak256(h(k) . p)

    //    p: The storage slot (aka, 3)
    // k: The key in hex
    // h: Some function based on the type. For uint256, it just pads the hex

    uint256 constant NOT_IN_STORAGE = 123;
    uint256 immutable i_not_in_storage;

    constructor() {
        favoriteNumber = 25; // See stored spot above // SSTORE
        someBool = true; // See stored spot above // SSTORE
        myArray.push(222); // SSTORE
        myMap[0] = true; // SSTORE
        i_not_in_storage = 123;
    }

    function doStuff() public {
        uint256 newVar = favoriteNumber + 1; // SLOAD
        bool otherVar = someBool; // SLOAD
        // ^^ memory variables
    }
}
