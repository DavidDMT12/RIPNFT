import "./Event.css";
const End=({state})=>{

    const endEvent = async(event)=>{
      event.preventDefault();
      const {contract2}=state;
      const id = document.querySelector("#id").value;
      const transaction = await contract2.endEvent(id)
      await transaction.wait();
      alert("Event was ended");
      window.location.reload();
    }
    return  (
      <div className="center">
       <h1>End Event </h1>
        <form onSubmit={endEvent}>
          <div className="inputbox">
            <input type="text" required="required" id="id" />
            <span>Event Id</span>
          </div>
          <div className="inputbox">
            <input type="submit" value="End Event"  disabled={!state.contract}/>
          </div>
        </form>
          
        </div>
      );
}
export default End;