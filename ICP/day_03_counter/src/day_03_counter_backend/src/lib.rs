use ic_cdk::{query, update};
use ic_cdk_macros::*;
use std::cell::RefCell;
use candid::types::number::Nat;
thread_local! {
    static COUNTER: RefCell<Nat> = RefCell::new(Nat::from (0 as u32));
}

#[update]
fn increment() -> Nat {
    COUNTER.with(|counter| {
        *counter.borrow_mut() += Nat::from(1 as u32) ;
    });
    get_value()
}

#[update]
fn decrement() -> Nat {
    COUNTER.with(|counter| {
        *counter.borrow_mut() -= Nat::from(1 as u32);
    });
    get_value()
}

#[query]
fn get_value() -> Nat {
    COUNTER.with(|counter| counter.borrow().clone())
}

