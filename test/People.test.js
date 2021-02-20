const People = artifacts.require("People");
const AssertionError = require("assertion-error");
const truffleAssert = require("truffle-assertions");

contract("People", async function(){
    it("shouldn't create a person with age over 150 years", async function() {
        let instance = await People.deployed();
        await truffleAssert.fails(instance.createPerson("Bob", 200, 190, {value: web3.utils.toWei("1", "ether")}), truffleAssert.ErrorType.REVERT);

    });

    it("shouldn't create a person without payment", async function() {
        let instance = await People.deployed();
        await truffleAssert.fails(instance.createPerson("Bob", 50, 190, {value: 1000}), truffleAssert.ErrorType.REVERT);
    });

    it("should set senior status correctly", async function() {
        let instance = await People.deployed();
        await instance.createPerson("Bob", 65, 190, {value: web3.utils.toWei("1", "ether")});
        let result = await instance.getPerson();
        assert(result.senior === true, "Senior level not true");
    });

    it("should set age correctly", async function() {
        let instance = await People.deployed();
        let result = await instance.getPerson();
        assert(result.age.toNumber() === 65, "Age is not set correctly");
    });
});