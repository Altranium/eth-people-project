const People = artifacts.require("People");
const AssertionError = require("assertion-error");
const truffleAssert = require("truffle-assertions");

contract("People", async function(accounts){

    let instance;

    beforeEach(async function(){
        instance = await People.deployed()
    });

    it("shouldn't create a person with age over 150 years", async function() {
        await truffleAssert.fails(instance.createPerson("Bob", 200, 190, {value: web3.utils.toWei("1", "ether")}), truffleAssert.ErrorType.REVERT);

    });

    it("shouldn't create a person without payment", async function() {
        await truffleAssert.fails(instance.createPerson("Bob", 50, 190, {value: 1000}), truffleAssert.ErrorType.REVERT);
    });

    it("should set senior status correctly", async function() {
        await instance.createPerson("Bob", 65, 190, {value: web3.utils.toWei("1", "ether")});
        let result = await instance.getPerson();
        assert(result.senior === true, "Senior level not true");
    });

    it("should set age correctly", async function() {
        let result = await instance.getPerson();
        assert(result.age.toNumber() === 65, "Age is not set correctly");
    });

    it("should not make non-owner able to delete people", async function() {
        await instance.createPerson("Alice", 35, 190, {value: web3.utils.toWei("1", "ether"), from: accounts[1]});
        await truffleAssert.fails(instance.deletePerson(accounts[1], {from: accounts[1]}), truffleAssert.ErrorType.REVERT);
    });

    it("should make the owner able to delete people", async function() {
        instance = await People.new();
        await truffleAssert.passes(instance.deletePerson(accounts[1], {from: accounts[0]}));
    });

    // When person is added, balance is increased and matches the balance variable
    it("should make the owner able to withdraw the balance", async function() {
        await instance.createPerson("Alice", 35, 190, {value: web3.utils.toWei("1", "ether"), from: accounts[1]});
        await truffleAssert.passes(instance.withdrawAll({from: accounts[0]}));
    });

    // Contract owner can withdraw that balance
    it("shouldn't make non-owners able to withdraw the balance", async function() {
        await instance.createPerson("Alice", 35, 190, {value: web3.utils.toWei("1", "ether"), from: accounts[1]});
        await truffleAssert.fails(instance.withdrawAll({from: accounts[1]}), truffleAssert.ErrorType.REVERT);
    });

    // Balance is increased for owner when withdrawn
    it("should increase the owners's balance after withdrawal", async function() {
        await instance.createPerson("Alice", 35, 190, {value: web3.utils.toWei("1", "ether"), from: accounts[1]});
        let previousBalance = parseFloat(await web3.eth.getBalance(accounts[0]));
        await instance.withdrawAll();
        let currentBalance = parseFloat(await web3.eth.getBalance(accounts[0]));
        assert(currentBalance > previousBalance, "Owners balance was not increased after withdrawal");
    });

    // Balance is 0 when withdrawn all of it
    it("should reset contract balance to 0 after withdrawal", async function() {
        await instance.createPerson("Alice", 35, 190, {value: web3.utils.toWei("1", "ether"), from: accounts[1]});
        await instance.withdrawAll();
        let balance = parseFloat(await instance.balance());
        let contractBalance = parseFloat(await web3.eth.getBalance(instance.address));
        assert(balance === 0 && balance == contractBalance, "Contract balance not 0 after withdrawal");
    });
});