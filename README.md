# D3-Interactive-Tree
An interactive self organizing tree with D3. Allows deletion and insertions at any level. Can easily modified
to edit any hierarchical data in json format by binding data to nodes.

Some of the problems with trying to animate a D3 tree using Reingold–Tilford Tree layout is that it will 
break down if the root node has less than 2 children. So in order to accommodate for the use case that 
a user will delete nodes and add nodes and could end up breaking the tree some hard coding needed to be 
done. 

