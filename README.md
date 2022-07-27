# hardhat-fund-me

by learning

1. FundMe Contract
2. Mock & Deploy & Verify
3. Unit and Staging

    1. Error Caused By : Not export fundMe - "all" tag, and then use `hardhat-deploy` cannot find module `all` exported
       by fundMe Contract
    2. Command
        - `yarn hardhat test`
        - `yarn hardhat test --network hardhat`
        - `yarn hardhat test --grep "amount funded"` grep some unit test which we defined
        - `yarn hardhat coverage` get Test Coverage Info

4. JS Debugger (open a debugger [Run and Debug], and then check debug infos)

5. Staging Test

    1. `yarn hardhat deplpy --network rinkeby` (config network rpc, user private key)

6. LocalNetwork Test
    1. Open a local Node `yarn hardhat node`
    2. `yarn hardhat run .\scripts\fund.js --network localhost`
       file + network in localhost

7. todo  Add getStorage and read slot
