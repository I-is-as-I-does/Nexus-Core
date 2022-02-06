/*! Nexus | (c) 2021-22 I-is-as-I-does | AGPLv3 license */
export class Spinner {
  constructor(spinContainer, spinStates = [], speed = 100) {
    this.spinContainer = spinContainer
    if(!spinStates.length){
        spinStates = ["", "/", "–", "\\", "|"]
    } else if(spinStates.length[0] !== ''){
        spinStates.unshift('')
    }
    this.spinStates = spinStates
    this.speed = speed
    this.spinPosition = -1
  }

  endSpin() {
    this.spinPosition = -1
  }
  
  startSpin() {
    this.spinPosition = 0
    var f = window.setInterval(function(){
        if (this.spinPosition === -1) {
            this.spinContainer.textContent = ''
            clearInterval(f)
          } else {
            this.spinContainer.textContent = this.spinStates[this.spinPosition]
            if (this.spinPosition === this.spinStates.length) {
              this.spinPosition = 1
            } else {
              this.spinPosition++
            }
          }
    }.bind(this), this.speed)
  }
}
