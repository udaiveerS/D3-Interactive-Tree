var diameter = 800;
var height = diameter -150; 
var n =  {
    "name": "Top Level",
    "id": 1
  }; 


var tree = d3.layout.tree()
    .size([360, diameter / 2 - 120])
    .separation(function(a, b) { return (a.parent == b.parent ? 1 : 2) / a.depth; });

var diagonal = d3.svg.diagonal.radial()
    .projection(function(d) { return [d.y, d.x / 180 * Math.PI]; });
  
var myZoom = d3.behavior.zoom()
              .scaleExtent([.5, 10])
              .on("zoom", zoom);

var container = d3.select("body").append("svg")
    .attr("width", diameter)
    .attr("height", height)
    .style('border', '1px solid black') 
    .call(myZoom);


//I am centering my node here, but if I pan the node it jump 
var svg = container.append("g")
      .attr("transform", "translate(" + diameter/2 + "," + height/2 + ")");


myZoom.translate([diameter/2,height/2 ]); 

var init = true; 

    function zoom() {
         svg.attr("transform", "translate("+ (d3.event.translate[0]) + "," + (d3.event.translate[1])  +")scale(" + d3.event.scale + ")");
    }
   
  var nodes = tree(n);
  //make sure to set the parent x and y for all nodes 
  nodes.forEach( function(node) {
      if(node.id == 1) {
        node.px = node.x = 500;
        node.py = node.y = 304;
      } else {
        node.px = node.parent.x;
        node.py = node.parent.y;
      }
  }); 

// Build a array for borken tree case 
var myCords = d3.range(50); 
buildSingleTreeData(); 

var id = ++nodes.length; 

function update(root) {

  var node = svg.selectAll(".node"); 
  var link = svg.selectAll(".link");


  nodes = tree.nodes(root);
  if(checkBrokenTree(root)) {
    if(!root.children || root.children.length ==0) {id = 2;}
    else {
      var returnId = resetIds(root,1);
      id = nodes.length+1; 
    }
    singleNodeBuild(nodes); 
  }

  links = tree.links(nodes);

  /*This is a data join on all nodes and links 
  if a node is added a link will also be added 
  they are based parsing of the root*/
  node = node.data(nodes, function(d) { return d.id; });
  link = link.data(links, function(d) { return d.source.id + "-" + d.target.id; });


  var enterNodes = node.enter().append("g")
        .attr("class", "node")
        .attr("transform", function(d) {
          d.tx = (d.parent? d.parent.x: d.px)-90; return "rotate(" + ((d.parent? d.parent.x: d.px)-90) + 
          ")translate(" + d.py + ")"; })


  enterNodes.append('g')
      .attr('class', 'label')
      .each(function(d,i) { console.log(d); })
      .attr('transform', function(d) { return 'rotate('+-d.px+')'; })
      .append('text')
      .attr("dx", "-2em")
      .attr("dy", "2.5em")
      .text(function(d) { return d.name; });

  var circlesGroup = enterNodes.append('g')
        .attr('class','circles');

  var mainCircles = circlesGroup.append("circle")
        .attr('class','main')
        .attr("r", 5);
  
  circlesGroup.append("circle")
        .attr('class','delete')
        .attr('cx', 0)
        .attr('cy',0)
        .attr('fill','red')
        .attr('opacity',0.5)
        .attr("r", 0);

  circlesGroup.append("circle")
        .attr('class','add')
        .attr('cx', 0)
        .attr('cy',0)
        .attr('fill','blue')
        .attr('opacity',0.5)
        .attr("r", 0);  

  circlesGroup.on("mouseenter", function() {
    var elem = this.__data__; 
    elem1 = d3.selectAll(".delete").filter(function(d,i) { return elem.id == d.id? this: null;});
    elem2 = d3.selectAll(".add").filter(function(d,i) { return elem.id == d.id? this: null;});


    elem2.transition()
      .duration(duration)
      .attr('cx', -20)
      .attr('cy', 0)
      .attr("r", 7); 

    elem1.transition()
      .duration(duration)
      .attr('cx', 20)
      .attr('cy', 0)
      .attr("r", 7); 
  } ); 

  circlesGroup.on("mouseleave", function() {
    var elem = this.__data__; 
    elem1 = d3.selectAll(".delete").filter(function(d,i) { return elem.id == d.id? this: null;});
    elem2 = d3.selectAll(".add").filter(function(d,i) { return elem.id == d.id? this: null;});

    elem2.transition()
      .duration(duration)
      .attr('cy', 0)
      .attr('cx', 0)
      .attr("r", 0); 
      
    elem1.transition()
      .duration(duration)
      .attr('cy', 0)
      .attr('cx', 0)
      .attr("r", 0); 
  } ); 

  var linkEnter = link.enter()
      .insert("path",'.node')
      .attr("class", "link")
      .attr("d", function(d) {
          var o = {x: d.source.px,y: d.source.py }; 
          return diagonal({source: o, target: o}); 
        });


  // Delete node event handeler 
  node.select('.delete').on('click', function() {
    var p = this.__data__; 
    if(p.id != 1) {
      removeNode(p);
      var childArr = p.parent.children;
      childArr = childArr.splice(childArr.indexOf(p),1);
      update(n);
    }

    function removeNode(p) {
      if(!p.children) {
        if(p.id) { p.id = null; }
          return p; 
      }else {
          for(var i = 0; i < p.children.length; i++) {
            p.children[i].id == null; 
            removeNode(p.children[i]); 
        }
        p.children = null;
        return p; 
      }
    }
  }); 


  // The add node even handeler 
  node.select('.add').on('click', function() { 
    var p = this.__data__;
    var aId = id++; 
    var d = {name: 'name' + aId};  
    d.id = aId;
    if(p.children) { 
      p.children.push(d); 
    }
    else{ 
      p.children = [d]; 
    } 
    d.px = p.x;
    d.py = p.x;
    d3.event.preventDefault();

    update(n)
  });

  /* this is the update section of the graph and nodes will be
    updated to their current positions*/
   
    var duration = 1000;

    node.exit().remove(); 
    link.exit().remove();
    node.transition()
    .duration(duration)
    .attr("transform", function(d) {d.utx = (d.x-90); return "rotate(" + (d.x-90) + ")translate(" + d.y + ")"; })

    link.transition()
    .duration(duration).attr("d", diagonal); 

    node.select('g')
    .transition()
    .duration(duration)
    .attr('transform', function(d) { return 'rotate('+-d.utx+')'; });

    node.select('.circles').attr('transform', function(d) { return 'rotate('+-d.utx+')'; });

}

update(n);

/** make a manual tree for when it is just 
  a linked list. For some reason the algorithm will break down
  all nodes in tree only have one child.
*/ 

function buildSingleTreeData() {
   myCords = d3.range(50); 
  var offset = 130;
   myCords = myCords.map(function (n,i) {
      return {x:90,y:offset*i}; 
  }); 
}


/**
  This function will build single node tree where every node
  has 1 child. From testing this layout does not support 
  a layout for nodes tree less than size 3 so they must 
  be manually drawn. Also if evey node has one child then 
  the tree will also break down and as a result this fucntion
  is there to manually build a singe tree up to 50 nodes
*/ 

function resetIds(aNode, aId) {
  if(aNode.children) {
    for(var i = 0; i < aNode.children.length; i++) {
      aNode.children[i].id = ++aId; 
      resetIds(aNode.children[i],aId); 
    }
      return aId;
  }
}

function singleNodeBuild(nodes) {  
    nodes.forEach(function(elem) {
      var i = elem.id-1; 
        elem.x = myCords[i].x; elem.y = myCords[i].y; 
      });
  }

function checkBrokenTree(rootNode) {


    var size = nodes.length; 

     var val = 0; 
    function recur(nod, i) {
      if(nod.children) {
        return recur(nod.children[0], i+1);
      } else {
        return i+1;
      }
    }
    return recur(rootNode,val) == nodes.length;
}
