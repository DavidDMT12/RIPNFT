import "./Event.css";
const NFT=({state})=>{
//mintNFT(uint256 _eventID)
    const getNFT = async(event)=>{
      event.preventDefault();
      const {contract2}=state;
      const eventid = document.querySelector("#eventid").value;
      const transaction = await contract2.mintNFT(eventid)
      await transaction.wait();
      alert("NFT was minted");
      window.location.reload();
    }
    return  (
      <div className="center">
       <h1>Mint NFT </h1>
        <form onSubmit={getNFT}>
          <div className="inputbox">
            <input type="text" required="required" id="eventid" />
            <span>Eventid</span>
          </div>
          <div className="inputbox">
            <input type="submit" value="Mint NFT"  disabled={!state.contract}/>
          </div>
        </form>
          
        </div>
      );
}
export default NFT;