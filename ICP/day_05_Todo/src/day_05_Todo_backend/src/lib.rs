use candid::CandidType;
use candid::Principal;
use ic_cdk::{caller, init, query, update};
use serde::Deserialize;
use std::cell::RefCell;
use std::collections::HashMap;

// --------------------
// Data Structures
// --------------------

// Task with title, description, and completed status.
#[derive(Clone, Debug, Default, CandidType, Deserialize)]
pub struct Task {
    pub id: u64,
    pub title: String,
    pub description: String,
    pub completed: bool,
}

// Each user account stores a username, password, and its own to‑do list.
#[derive(Clone, Debug, Default, CandidType, Deserialize)]
pub struct UserAccount {
    pub username: String,
    pub password: String,
    pub tasks: HashMap<u64, Task>,
    pub next_id: u64,
}

// --------------------
// Global State
// --------------------

// Global map of user accounts keyed by their Principal.
thread_local! {
    static ACCOUNTS: RefCell<HashMap<Principal, UserAccount>> = RefCell::new(HashMap::new());
}

// Global admin Principal, set at initialization.
thread_local! {
    static ADMIN: RefCell<Principal> = RefCell::new(Principal::anonymous());
}

// --------------------
// Initialization
// --------------------

#[init]
fn init() {
    let caller = caller();
    ADMIN.with(|admin| {
        *admin.borrow_mut() = caller;
    });
}

// --------------------
// Account Methods
// --------------------

/// Create a new account for the caller with a username and password.
/// Returns `true` if the account was created or `false` if one already exists.
#[update]
pub fn create_account(username: String, password: String) -> bool {
    let caller = caller();
    ACCOUNTS.with(|accounts| {
        let mut accounts = accounts.borrow_mut();
        if accounts.contains_key(&caller) {
            // Account already exists.
            false
        } else {
            accounts.insert(
                caller,
                UserAccount {
                    username,
                    password,
                    tasks: HashMap::new(),
                    next_id: 0,
                },
            );
            true
        }
    })
}

/// Log in using the username and password.
/// Returns `true` if credentials match, or `false` otherwise.
#[query]
pub fn login(username: String, password: String) -> bool {
    let caller = caller();
    ACCOUNTS.with(|accounts| {
        if let Some(account) = accounts.borrow().get(&caller) {
            account.username == username && account.password == password
        } else {
            false
        }
    })
}

// --------------------
// To‑Do List Methods (User-Level)
// --------------------

/// Adds a task to the account of the caller.
/// Returns the new task's ID on success or an error message if the account doesn't exist.
#[update]
pub fn add_task(title: String, description: String) -> Result<u64, String> {
    let caller = caller();
    ACCOUNTS.with(|accounts| {
        let mut accounts = accounts.borrow_mut();
        if let Some(account) = accounts.get_mut(&caller) {
            let task_id = account.next_id;
            account.tasks.insert(
                task_id,
                Task {
                    id: task_id,
                    title,
                    description,
                    completed: false,
                },
            );
            account.next_id += 1;
            Ok(task_id)
        } else {
            Err("Account does not exist. Please create an account first.".into())
        }
    })
}

/// Removes a task from the caller's account.
/// Returns `true` if the task was found and removed.
#[update]
pub fn remove_task(id: u64) -> Result<bool, String> {
    let caller = caller();
    ACCOUNTS.with(|accounts| {
        let mut accounts = accounts.borrow_mut();
        if let Some(account) = accounts.get_mut(&caller) {
            Ok(account.tasks.remove(&id).is_some())
        } else {
            Err("Account does not exist. Please create an account first.".into())
        }
    })
}

/// Toggles the completion status of a task in the caller's account.
/// Returns `true` if the task was found and updated.
#[update]
pub fn toggle_task(id: u64) -> Result<bool, String> {
    let caller = caller();
    ACCOUNTS.with(|accounts| {
        let mut accounts = accounts.borrow_mut();
        if let Some(account) = accounts.get_mut(&caller) {
            if let Some(task) = account.tasks.get_mut(&id) {
                task.completed = !task.completed;
                Ok(true)
            } else {
                Ok(false)
            }
        } else {
            Err("Account does not exist. Please create an account first.".into())
        }
    })
}

/// Returns a list of tasks for the caller.
#[query]
pub fn list_tasks() -> Result<Vec<Task>, String> {
    let caller = caller();
    ACCOUNTS.with(|accounts| {
        if let Some(account) = accounts.borrow().get(&caller) {
            Ok(account.tasks.values().cloned().collect())
        } else {
            Err("Account does not exist. Please create an account first.".into())
        }
    })
}

/// Retrieves a specific task by its ID from the caller's account.
#[query]
pub fn get_task(id: u64) -> Result<Option<Task>, String> {
    let caller = caller();
    ACCOUNTS.with(|accounts| {
        if let Some(account) = accounts.borrow().get(&caller) {
            Ok(account.tasks.get(&id).cloned())
        } else {
            Err("Account does not exist. Please create an account first.".into())
        }
    })
}

// --------------------
// Admin-Only Methods
// --------------------

/// Assigns a task to another user.
/// **Admin-only:** Only the admin can assign tasks to other users.
#[update]
pub fn assign_task_to_user(
    user: Principal,
    title: String,
    description: String,
) -> Result<u64, String> {
    let caller = caller();
    let is_admin = ADMIN.with(|admin| *admin.borrow() == caller);
    if !is_admin {
        return Err("Only admin can assign tasks to other users.".into());
    }
    ACCOUNTS.with(|accounts| {
        let mut accounts = accounts.borrow_mut();
        if let Some(account) = accounts.get_mut(&user) {
            let task_id = account.next_id;
            account.tasks.insert(
                task_id,
                Task {
                    id: task_id,
                    title,
                    description,
                    completed: false,
                },
            );
            account.next_id += 1;
            Ok(task_id)
        } else {
            Err("The specified user does not have an account.".into())
        }
    })
}

/// Returns a list of all user Principals.
/// **Admin-only:** Only the admin can view the list of all users.
#[query]
pub fn list_users() -> Result<Vec<Principal>, String> {
    let caller = caller();
    let is_admin = ADMIN.with(|admin| *admin.borrow() == caller);
    if !is_admin {
        return Err("Only admin can view the list of all users.".into());
    }
    ACCOUNTS.with(|accounts| {
        let accounts = accounts.borrow();
        Ok(accounts.keys().cloned().collect())
    })
}