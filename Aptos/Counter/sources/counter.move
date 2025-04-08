module counter::Counter {
    use std::signer;

    //:!:>resource
    struct Counter has key {
        value: u64,
    }
    //<:!:resource

    public entry fun initialize_counter(account: &signer){
        let counter = Counter{
            value: 0,
        };
        move_to(account, counter);
    }

    public entry fun get_counter(account: &signer): u64 acquires Counter {
        let counter_ref = borrow_global_mut<Counter>(signer::address_of(account));
        return counter_ref.value;
    }

    public entry fun reset(account: &signer) acquires Counter {
        let counter_ref = borrow_global_mut<Counter>(signer::address_of(account));
        counter_ref.value=0;
    }

    public entry fun increment(account: &signer) acquires Counter {
        let counter_ref = borrow_global_mut<Counter>(signer::address_of(account));
        counter_ref.value= counter_ref.value + 1;
    }
    public entry fun decrement(account: &signer) acquires Counter {
        let counter_ref = borrow_global_mut<Counter>(signer::address_of(account));
        counter_ref.value= counter_ref.value - 1;
    }
}
