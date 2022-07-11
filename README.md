# BATTLESHIP
<img src="image.png" width="1024"/>

# SETUP
* Clone the repository 
* Change working directory to current directory 
```
$ cd BATTLESHIP
```
* Run the following commnad to install ```http-server```
```
npm i http-server
```
* Run the following command to start the server
```
http-server
```
* Open browser and navigate to ```http://localhost:8080/``` to play the game

# Introduction 

* This game is built using Three.js . 
* The game offers different viewpoints for the player . 

## Player Ship
The playing ship has movement capabilities and can fire cannonballs at rival vessels. Additionally, the player ship has the ability to scavenge lost treasure from the sea. The player starts out with 100 life, and each attack from an opponent ship lowers that health by 5. When the player is down to zero health, the game is over.  
## Enemy Ship 
Around the player ship, enemy ships appear at random in a 250x250 unit square. Once they are a certain distance away from the player ship, they can periodically fire cannonballs at it. Every strike from the player ship decreases the opposing ship's health by 25 out of a total of 100.  
## Treasure Chests  
Around the player ship, a square of 250x250 units containing treasure chests will randomly spawn. They can be gathered by the player ship to raise the player's score.  
# Controls  
**W** -> Move Forward  
**S** -> Move Back  
**A** -> Move Left  
**D** -> Move Right  
**Q** -> Fire Cannonball  
**1** -> Third-Person View    
**2** Bird's Eye view  


