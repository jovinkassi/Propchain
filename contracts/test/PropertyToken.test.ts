import { expect } from "chai";
import { ethers } from "hardhat";
import { PropertyToken } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("PropertyToken", () => {
  let token: PropertyToken;
  let admin: HardhatEthersSigner;
  let manager: HardhatEthersSigner;
  let buyer: HardhatEthersSigner;

  beforeEach(async () => {
    [admin, manager, buyer] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("PropertyToken");
    token = await Factory.deploy();

    await token.grantRole(await token.PROPERTY_MANAGER_ROLE(), manager.address);
    await token.grantRole(await token.KYC_ROLE(), admin.address);
    await token.setKYC(buyer.address, true);
  });

  it("lists a property", async () => {
    await token.connect(manager).listProperty(
      "Marina Tower A",
      "Dubai Marina, UAE",
      ethers.parseEther("1000000"),
      500
    );
    const prop = await token.getProperty(1);
    expect(prop.name).to.equal("Marina Tower A");
    expect(prop.active).to.be.true;
  });

  it("allows KYC buyer to purchase tokens", async () => {
    await token.connect(manager).listProperty("Test Property", "Abu Dhabi", ethers.parseEther("100"), 300);
    await token.connect(buyer).purchaseTokens(1, 10, { value: ethers.parseEther("10") });
    expect(await token.balanceOf(buyer.address)).to.equal(10);
  });

  it("blocks non-KYC purchase", async () => {
    await token.connect(manager).listProperty("Test Property", "Abu Dhabi", ethers.parseEther("100"), 300);
    await expect(
      token.connect(manager).purchaseTokens(1, 10, { value: ethers.parseEther("10") })
    ).to.be.revertedWith("PropertyToken: KYC required");
  });
});
