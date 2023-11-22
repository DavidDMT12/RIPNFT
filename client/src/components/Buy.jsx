import "./Buy.css";
const Buy=({state})=>{

    const buyF = async(event)=>{
      event.preventDefault();
      const {contract}=state;
      const {contract2}=state;
      const amount1 = document.querySelector("#amount1").value;
      const approval = await contract.approve('0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0', amount1);
      await approval.wait();
      const transaction = await contract2.getFcoins(amount1)
      await transaction.wait();
      alert("Transaction is successul");
      window.location.reload();
    }
    return  (
      <div className="center">
       <h1>GetFcoins</h1>
        <form onSubmit={buyF}>
          <div className="inputbox">
            <input type="text" required="required" id="amount1" />
            <span>Amount</span>
          </div>
          <div className="inputbox">
            <input type="submit" value="Buy"  disabled={!state.contract}/>
          </div>
        </form>
          
        </div>
      );
}
export default Buy;