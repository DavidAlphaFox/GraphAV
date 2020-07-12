import React, {ReactElement, useRef} from 'react';
import Container from './Container';
import GraphNode from '../GraphNode/GraphNode';
import Edge from '../Edge/Edge';
import NodeInfo from '../../models/NodeInfo';

interface Props {
  adjacencyList: Array<Array<number>>;
  visited: Array<number>;
  zoomPercentage: number;
  graphInfo: Array<NodeInfo>;
  currentEdge: [number, number];
  onNodeConnect: (nodeIndex: number) => void;
  onEdgeDelete: (firstNode: number, secondNode: number) => void;
}

const GraphCanvas: React.FC<Props> = (props: Props): ReactElement => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const adjacencyList = props.adjacencyList;
  const visited = props.visited;
  const currentEdge = props.currentEdge;
  const nodeRefs = adjacencyList.map((_) => React.createRef<HTMLSpanElement>());
  const reducedEdges: Map<number, Array<number>> = new Map();
  const connectedNodePairs: Array<Array<number>> = [];

  adjacencyList.forEach((adjacentNodes: Array<number>, currentNode: number) => {
    const currentNodeEdges: Array<number> = [];
    adjacentNodes.forEach((adjacentNode: number) => {
      if (!reducedEdges.get(adjacentNode)?.includes(currentNode)) {
        currentNodeEdges.push(adjacentNode);
        connectedNodePairs.push([currentNode, adjacentNode]);
      }
    });
    if (currentNodeEdges.length !== 0) {
      reducedEdges.set(currentNode, currentNodeEdges);
    }
  });

  return (
    <Container ref={canvasRef}>
      {adjacencyList.map((val: Array<number>, index: number) => {
        const nodeInfo: NodeInfo =
          index > props.graphInfo.length - 1
            ? ({shortestPath: undefined, previousNode: undefined} as NodeInfo)
            : props.graphInfo[index];
        return (
          <GraphNode
            connectNode={() => props.onNodeConnect(index)}
            key={index}
            canvasRef={canvasRef}
            isActive={visited.includes(index)}
            content={(index + 1).toString()}
            edgeRef={nodeRefs[index]}
            zoomPercentage={props.zoomPercentage}
            nodeInfo={nodeInfo}
          >
            <span ref={nodeRefs[index]}></span>
          </GraphNode>
        );
      })}

      {/* TODO:add directed logic */}
      {connectedNodePairs.map(([n1, n2]: Array<number>, index: number) => {
        const isVisited: boolean =
          (currentEdge[0] === n1 && currentEdge[1] === n2) ||
          (currentEdge[0] === n2 && currentEdge[1] === n1);

        const onDelete = () => {
          props.onEdgeDelete(n1, n2);
        };

        return (
          <Edge
            onDelete={onDelete}
            n1={nodeRefs[n1]}
            n2={nodeRefs[n2]}
            key={`${n1}${n2}`}
            isDirected={!adjacencyList[n2].includes(n1)}
            zoomPercentage={props.zoomPercentage}
            isVisited={isVisited}
          />
        );
      })}
    </Container>
  );
};

export default GraphCanvas;
