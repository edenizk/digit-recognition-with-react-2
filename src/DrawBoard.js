import React, { Component } from "react";
import './App.css';
import CanvasDraw from "react-canvas-draw";
import * as tf from '@tensorflow/tfjs';

class DrawBoard extends Component {

    constructor(props){
      super(props)

      this.state = {
        color: "#ffc600",
        width: 300,
        height: 300,
        brushRadius: 5,
        lazyRadius: 1,
        model: undefined,
        prediction: null,
        confidence: null,
        answer: null,
      };

      this.loadModel();
    }

   


    async recognize() {
      console.log("recognizing...")
      let myCanvas = document.querySelectorAll('canvas')[1]
      // get image data from canvas
      var imageData = myCanvas.toDataURL();
      console.log("getting imagge...")

      // preprocess canvas
      let tensor = await this.preprocessCanvas(myCanvas);
      console.log("tensor...")

      // make predictions on the preprocessed image tensor
      let predictions = await this.state.model.predict(tensor).data();
      console.log("prediction...")

      // get the model's prediction results
      let results = Array.from(predictions);
      console.log("result...")

      // display the predictions in chart
      // displayChart(results);
      this.displayLabel(results);
    }

    async loadModel() {
      
      // load the model using a HTTPS request (where you have stored your model files)
      this.setState({
        model: await tf.loadLayersModel("models/model.json")
      })
    }

    async preprocessCanvas(image) {
      // resize the input image to target size of (1, 28, 28)
      let tensor = await tf.browser.fromPixels(image)
          .resizeNearestNeighbor([28, 28])
          .mean(2)
          .expandDims(2)
          .expandDims()
          .toFloat();
      return tensor.div(255.0);
  }

  displayLabel(data) {
    var max = data[0];
    var maxIndex = 0;
 
    for (var i = 1; i < data.length; i++) {
        if (data[i] > max) {
            maxIndex = i;
            max = data[i];
        }
    }
    this.setState({
      prediction: maxIndex,
      confidence: Math.trunc( max*100 ),
      answer: Math.trunc( max*100 ) !== 100 ? "I am guesing that you draw " + maxIndex + "but I am sure like " + Math.trunc( max*100 ) + "%" : "Is this your number?: " +  maxIndex,
    })
    console.log("Predicting you draw " + maxIndex + " with " + Math.trunc( max*100 ) + " confidence")
  }

    render(){
      return (
      <div className="board">
        <div className="tools">
          <div>
            <label>Width:</label>
            <input
              type="number"
              value={this.state.width}
              onChange={e =>
                this.setState({ width: parseInt(e.target.value, 10) })
              }
            />
          </div>
          <div>
            <label>Height:</label>
            <input
              type="number"
              value={this.state.height}
              onChange={e =>
                this.setState({ height: parseInt(e.target.value, 10) })
              }
            />
          </div>
          <div>
            <label>Brush-Radius:</label>
            <input
              type="number"
              value={this.state.brushRadius}
              onChange={e =>
                this.setState({ brushRadius: parseInt(e.target.value, 10) })
              }
            />
          </div>
          <div>
            <label>Lazy-Radius:</label>
            <input
              type="number"
              value={this.state.lazyRadius}
              onChange={e =>
                this.setState({ lazyRadius: parseInt(e.target.value, 10) })
              }
            />
          </div>
        </div>
        <div className="canvasWrapper">
          <CanvasDraw
            ref={canvasDraw => (this.saveableCanvas = canvasDraw)}
            brushColor={this.state.color}
            brushRadius={this.state.brushRadius}
            lazyRadius={this.state.lazyRadius}
            canvasWidth={this.state.width}
            canvasHeight={this.state.height}
          />
          
        </div> 
        <button
            onClick={() => {
              this.saveableCanvas.clear();
            }}
          >
            Clear
          </button>
          <button
            onClick={() => {
              this.saveableCanvas.undo();
            }}
          >
            Undo
          </button>
          <button
            onClick={() => {
              this.recognize();
            }}
          >
            Recognize
          </button>
        {
          this.state.prediction != null ?
          <div className="prediction">
          {
            this.state.confidence !== 100 ? 
            <div>
              <h2>I am guessing that you draw <span className="highlight">{this.state.prediction}</span></h2>
              <h3>but I am sure like <span className="highlight">{this.state.confidence}%</span></h3>
            </div> : 
            <h2>Is this your number? <span className="highlight">{ this.state.prediction }</span></h2>
          }
          </div>: null
        }
      </div>
    ) 
  }
}

export default DrawBoard;