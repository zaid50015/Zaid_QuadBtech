module gas_refund_demo::gas_refund {
    use std::signer;
    
    struct State has key {
        data: vector<u8>
    }

    public entry fun create_state(account: &signer) {
        let state = State {
            data: b"some_state_data"
        };
        move_to(account, state);
    }

    public entry fun delete_state(account: &signer) acquires State {
        let State { data: _ } = move_from<State>(signer::address_of(account));
    }
}