function getpm25Level(pm25) {
    if (pm25 <= 35) {
        return 1;
    } else if (35 < pm25 && pm25 <= 75) {
        return 2;
    } else if (75 < pm25 && pm25 <= 115) {
        return 3;
    } else if (115 < pm25 && pm25 <= 150) {
        return 4;
    } else if (150 < pm25 && pm25 <= 250) {
        return 5;
    } else if (250 < pm25 && pm25 <= 300) {
        return 6;
    } else if (300 < pm25) {
        return 7;
    } else {
        return 8;
    }
}

function getpm10Level(pm10) {
    if (pm10 <= 50) {
        return 1;
    } else if (pm10 <= 150) {
        return 2;
    } else if (pm10 <= 250) {
        return 3;
    } else if (pm10 <= 350) {
        return 4;
    } else if (pm10 <= 420) {
        return 5;
    } else if (pm10 <= 500) {
        return 6;
    } else if (pm10 <= 600) {
        return 7;
    } else {
        return 8;
    }
}
function getpmlevel(type, value) {
    let v = parseInt(value)
    if (isNaN(v)) {
        return "_invalid"
    }
    if (type == "pm25") {
        return getpm25Level(value)
    } else {
        return getpm10Level(value)
    }
}
function floatTo1Point(x){
  let y=parseFloat(x)
  if(isNaN(y)){
      return y
  }else{
      return parseFloat(y.toFixed(1))
  }
}
export {getpmlevel,floatTo1Point}