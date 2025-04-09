module banking::lending {
    use std::signer;
    use aptos_framework::coin;
    use aptos_framework::aptos_coin::AptosCoin;
    use aptos_std::table::{Self, Table};

    const ENOT_ENOUGH_DEPOSITS: u64 = 1;

    struct LenderInfo has copy, drop, store {
        amount: u64,
    }

    struct BorrowerInfo has copy, drop, store {
        amount: u64,
    }

    struct LendingPool has key {
        total_deposits: u64,
        total_borrowed: u64,
        lenders: Table<address, LenderInfo>,
        borrowers: Table<address, BorrowerInfo>,
    }

    public entry fun init(account: &signer) {
        move_to(
            account,
            LendingPool {
                total_deposits: 0,
                total_borrowed: 0,
                lenders: table::new(),
                borrowers: table::new(),
            }
        );
    }

    public entry fun deposit(account: &signer, amount: u64) acquires LendingPool {
        let addr = signer::address_of(account);
        let pool = borrow_global_mut<LendingPool>(addr);
        
        // Transfer coins from user to contract
        let coin = coin::withdraw<AptosCoin>(account, amount);
        coin::deposit(addr, coin);
        
        pool.total_deposits = pool.total_deposits + amount;
        
        if (table::contains(&pool.lenders, addr)) {
            let lender = table::borrow_mut(&mut pool.lenders, addr);
            lender.amount = lender.amount + amount;
        } else {
            table::add(&mut pool.lenders, addr, LenderInfo { amount });
        }
    }

    public entry fun borrow(account: &signer, amount: u64) acquires LendingPool {
        let addr = signer::address_of(account);
        let pool = borrow_global_mut<LendingPool>(addr);
        
        assert!(
            pool.total_deposits - pool.total_borrowed >= amount,
            ENOT_ENOUGH_DEPOSITS
        );

        // Transfer coins from contract to borrower
        let coin = coin::withdraw<AptosCoin>(account, amount);
        coin::deposit(addr, coin);
        
        pool.total_borrowed = pool.total_borrowed + amount;
        
        if (table::contains(&pool.borrowers, addr)) {
            let borrower = table::borrow_mut(&mut pool.borrowers, addr);
            borrower.amount = borrower.amount + amount;
        } else {
            table::add(&mut pool.borrowers, addr, BorrowerInfo { amount });
        }
    }
}