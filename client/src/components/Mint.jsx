import {ethers} from "ethers"
import "./Mint.css";
const Mint=({state})=>{
    const mintDAI = async(event)=>{
      event.preventDefault();
      const {contract}=state;
      const address = document.querySelector("#address").value;
      const amount = document.querySelector("#amount").value;
      const transaction = await contract.mint(address, amount)
      await transaction.wait();
      alert("Transaction is successul");
      window.location.reload();
    }
    return  (
      <div className="center">
       <h1>Faucet</h1>
        <form onSubmit={mintDAI}>
          <div className="inputbox">
            <input type="text" required="required" id="address" />
            <span>Address</span>
          </div>
          <div className="inputbox">
            <input type="text" required="required" id="amount" />
            <span>Amount</span>
          </div>
          <div className="inputbox">
            <input type="submit" value="Mint"  disabled={!state.contract}/>
          </div>
        </form>
        </div>
      );
}
export default Mint;