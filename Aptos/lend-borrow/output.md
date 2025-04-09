 aptos move compile --named-addresses banking=default
aptos move publish --named-addresses banking=default --profile default
Compiling, may take a little while to download git dependencies...
UPDATING GIT DEPENDENCY https://github.com/aptos-labs/aptos-framework.git
INCLUDING DEPENDENCY AptosFramework
INCLUDING DEPENDENCY AptosStdlib
INCLUDING DEPENDENCY MoveStdlib
BUILDING lend_borrow
{
  "Result": [
    "51d4b02e3b3f4335d843145e959bf7f5a8349b1bfc60997701ee20c940a1aadc::lending"
  ]
}
Compiling, may take a little while to download git dependencies...
UPDATING GIT DEPENDENCY https://github.com/aptos-labs/aptos-framework.git
INCLUDING DEPENDENCY AptosFramework
INCLUDING DEPENDENCY AptosStdlib
INCLUDING DEPENDENCY MoveStdlib
BUILDING lend_borrow
package size 2151 bytes
Do you want to submit a transaction for a range of [177500 - 266200] Octas at a gas unit price of 100 Octas? [yes/no] >
yes
Transaction submitted: https://explorer.aptoslabs.com/txn/0x6a371aa846dfb9f62e30c9ccf55ff4c805c65dde138f7b97e7615e03f449855f?network=devnet
{
  "Result": {
    "transaction_hash": "0x6a371aa846dfb9f62e30c9ccf55ff4c805c65dde138f7b97e7615e03f449855f",
    "gas_used": 1775,
    "gas_unit_price": 100,
    "sender": "51d4b02e3b3f4335d843145e959bf7f5a8349b1bfc60997701ee20c940a1aadc",
    "sequence_number": 0,
    "success": true,
    "timestamp_us": 1744180986560187,
    "version": 313161501,
    "vm_status": "Executed successfully"
  }
}
zaid@DESKTOP-DA74LGL:~/Zaid_QuadBtech/Aptos/lend-borrow$ aptos move run --function-id default::lending::init --profile default
Do you want to submit a transaction for a range of [47000 - 70500] Octas at a gas unit price of 100 Octas? [yes/no] >
yes
Transaction submitted: https://explorer.aptoslabs.com/txn/0xb1e743df21a426689ce31fabd22fcefad394cb14199ac0f8e19fa0d296ff87dc?network=devnet
{
  "Result": {
    "transaction_hash": "0xb1e743df21a426689ce31fabd22fcefad394cb14199ac0f8e19fa0d296ff87dc",
    "gas_used": 470,
    "gas_unit_price": 100,
    "sender": "51d4b02e3b3f4335d843145e959bf7f5a8349b1bfc60997701ee20c940a1aadc",
    "sequence_number": 1,
    "success": true,
    "timestamp_us": 1744181006488950,
    "version": 313161666,
    "vm_status": "Executed successfully"
  }
}
zaid@DESKTOP-DA74LGL:~/Zaid_QuadBtech/Aptos/lend-borrow$ aptos account fund-with-faucet --profile default --amount 10000
aptos move run --function-id default::lending::deposit --args u64:5000 --profile default
{
  "Result": "Added 10000 Octas to account 0x51d4b02e3b3f4335d843145e959bf7f5a8349b1bfc60997701ee20c940a1aadc"
}
Do you want to submit a transaction for a range of [43800 - 65700] Octas at a gas unit price of 100 Octas? [yes/no] >
yes
Transaction submitted: https://explorer.aptoslabs.com/txn/0x99783ca2bf97b71bc9bfce7c8421aee5588954400e2d464d6ddd5a182c177a2e?network=devnet
{
  "Result": {
    "transaction_hash": "0x99783ca2bf97b71bc9bfce7c8421aee5588954400e2d464d6ddd5a182c177a2e",
    "gas_used": 438,
    "gas_unit_price": 100,
    "sender": "51d4b02e3b3f4335d843145e959bf7f5a8349b1bfc60997701ee20c940a1aadc",
    "sequence_number": 2,
    "success": true,
    "timestamp_us": 1744181028355131,
    "version": 313161846,
    "vm_status": "Executed successfully"
  }
}
zaid@DESKTOP-DA74LGL:~/Zaid_QuadBtech/Aptos/lend-borrow$ aptos move run --function-id default::lending::borrow --args u64:2000 --profile default
Do you want to submit a transaction for a range of [43800 - 65700] Octas at a gas unit price of 100 Octas? [yes/no] >
yes
Transaction submitted: https://explorer.aptoslabs.com/txn/0xe3ef6febca5358536ffa50b43805d50b04e73d0472b2365679c5764a508ead5d?network=devnet
{
  "Result": {
    "transaction_hash": "0xe3ef6febca5358536ffa50b43805d50b04e73d0472b2365679c5764a508ead5d",
    "gas_used": 438,
    "gas_unit_price": 100,
    "sender": "51d4b02e3b3f4335d843145e959bf7f5a8349b1bfc60997701ee20c940a1aadc",
    "sequence_number": 3,
    "success": true,
    "timestamp_us": 1744181044290391,
    "version": 313161977,
    "vm_status": "Executed successfully"
  }
}
