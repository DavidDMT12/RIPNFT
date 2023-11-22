import "./Buy.css";
const Pay=({state})=>{

    const payRes = async(event)=>{
      event.preventDefault();
      const {contract2}=state;
      const evid = document.querySelector("#evid").value;
      const tip = document.querySelector("#tip").value;
      const transaction = await contract2.payRespects(evid, tip);
      await transaction.wait();
      alert("Transaction is successul");
      window.location.reload();
    }
    return  (
      <div className="center">
       <h1>Pay Respects</h1>
        <form onSubmit={payRes}>
          <div className="inputbox">
            <input type="text" required="required" id="evid" />
            <span>EventID</span>
          </div>
          <div className="inputbox">
            <input type="text" required="required" id="tip" />
            <span>Tip</span>
          </div>
          <div className="inputbox">
            <input type="submit" value="Pay Respects"  disabled={!state.contract}/>
          </div>
        </form>
          
        </div>
      );
}
export default Pay;