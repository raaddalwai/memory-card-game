
chars = ["A", "B", "C", "D", "E", "F", "G", "H"]

gridSize = 4


usableChars = chars.slice(0, (gridSize*gridSize)/2 + 1)
usableList = [[...usableChars], [...usableChars]]

finalList = []
tempStore = null
score = 0

for (let i = 0; i < gridSize; i++) {
    
    row = document.createElement("div")
    row.classList.add("row")

    rowList = []
    
    for (let j = 0; j < gridSize; j++) {
        cell = document.createElement("div")
        cell.classList.add("cell")
        cell.dataset.row = i
        cell.dataset.column = j
        row.appendChild(cell)

        console.log(usableList)
        currUsableList = usableList[j%2]
        index = getRandomIntInclusive(0, currUsableList.length -1)
        rowList.push(currUsableList[index])
        
        currUsableList.splice(index, 1)

        cell.addEventListener("click", (event)=>{
            thisElem = event.target
            currRow = thisElem.dataset.row
            currColumn = thisElem.dataset.column
            figure = finalList[currRow][currColumn]
            console.log(`clicked ${currRow}, ${currColumn}, ${finalList[event.target.dataset.row][event.target.dataset.column]}`)

            thisElem.innerText = figure
            if(tempStore==null){
                tempStore = thisElem
            }else{
                if(figure == finalList[tempStore.dataset.row][tempStore.dataset.column]){
                    tempStore = null
                    incrementScore()
                }else{
                setTimeout(() => {
                    tempStore.innerText = ""
                    thisElem.innerText = ""
                    tempStore = null
                    
                }, 1000);

            }
                
            }
        })









    }


    gameArea.appendChild(row)
    finalList.push(rowList)

    
}

function incrementScore(){
    score++
    scoreElem.innerText = `Score: ${score}`
}

function getRandomIntInclusive(min, max) {
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled + 1)) + minCeiled;
}
