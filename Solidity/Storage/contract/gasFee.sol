// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract GasComparator {
    // Storage variables (expensive)
    uint public storageValue;
    string public storageText;
    
    // Memory demonstration variables
    uint[] public memoryArray;
    
    event GasUsed(uint gasUsed, string txType);

    // Simple transaction - minimal logic
    function simpleTransaction() external {
        uint startGas = gasleft();
        // No storage operations
        emit GasUsed(startGas - gasleft(), "simple");
    }

    // Storage transaction - multiple storage operations
    function storageTransaction(uint _value, string calldata _text) external {
        uint startGas = gasleft();
        
        storageValue = _value;     // Storage write (expensive)
        storageText = _text;       // Storage write (expensive)
        
        emit GasUsed(startGas - gasleft(), "storage");
    }

    // Memory transaction - memory operations
    function memoryTransaction(uint[] calldata _array) external {
        uint startGas = gasleft();
        
        // Memory operations (cheaper)
        uint[] memory localArray = new uint[](_array.length);
        for(uint i = 0; i < _array.length; i++) {
            localArray[i] = _array[i] * 2;
        }
        memoryArray = localArray;  // Single storage write
        
        emit GasUsed(startGas - gasleft(), "memory");
    }
}