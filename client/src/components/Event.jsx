import "./Event.css";
const Event=({state})=>{

    const startEvent = async(event)=>{
      event.preventDefault();
      const {contract2}=state;
      const name = document.querySelector("#name").value;
      const uri = document.querySelector("#uri").value;
      const duration = document.querySelector("#duration").value;
      const mintip = document.querySelector("#mintip").value;
      const transaction = await contract2.startEvent(name,uri,duration,mintip)
      await transaction.wait();
      alert("Transaction is successul");
      window.location.reload();
    }
    return  (
      <div className="center">
       <h1>Start Event </h1>
        <form onSubmit={startEvent}>
          <div className="inputbox">
            <input type="text" required="required" id="name" />
            <span>Name</span>
          </div>
          <div className="inputbox">
            <input type="text" required="required" id="uri" />
            <span>URI</span>
          </div>
          <div className="inputbox">
            <input type="text" required="required" id="duration" />
            <span>Duration minutes</span>
          </div>
          <div className="inputbox">
            <input type="text" required="required" id="mintip" />
            <span>Minimun tip</span>
          </div>
          <div className="inputbox">
            <input type="submit" value="Start Event"  disabled={!state.contract}/>
          </div>
        </form>
          
        </div>
      );
}
export default Event;