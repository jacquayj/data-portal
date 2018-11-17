import { connect } from 'react-redux';
import {
  setHoveringNode,
  setHighlightingNode,
  setFurtherHighlightingNodeID,
  setHighlightingNodeSVGElement,
} from '../../action.js';
import GraphDrawer from './GraphDrawer';

const ReduxGraphDrawer = (() => {
  const mapStateToProps = state => ({
    nodes: state.ddgraph.nodes,
    edges: state.ddgraph.edges,
    graphBoundingBox: state.ddgraph.graphBoundingBox,
    layoutInitialized: state.ddgraph.layoutInitialized,
    highlightingNode: state.ddgraph.highlightingNode,
    highlightingNodeSVGElement: state.ddgraph.highlightingNodeSVGElement,
    relatedNodeIDs: state.ddgraph.relatedNodeIDs,
    furtherClickableNodeIDs: state.ddgraph.furtherClickableNodeIDs,
    furtherHighlightedPath: state.ddgraph.furtherHighlightedPath,
    furtherHighlightingNodeID: state.ddgraph.furtherHighlightingNodeID,
    isGraphView: state.ddgraph.isGraphView,
  });

  const mapDispatchToProps = dispatch => ({
    onHoverNode: (node, hoveringNodeSVGElement) =>
      dispatch(setHoveringNode(node, hoveringNodeSVGElement)),
    onCancelHoverNode: () => dispatch(setHoveringNode(null)),
    onClickNode: (node, highlightingNodeSVGElement) =>
      dispatch(setHighlightingNode(node, highlightingNodeSVGElement)),
    onFurtherClickNode: nodeID => dispatch(setFurtherHighlightingNodeID(nodeID)),
    onHighlightingNodeSVGElementUpdated: highlightingNodeSVGElement =>
      dispatch(setHighlightingNodeSVGElement(highlightingNodeSVGElement)),
  });

  return connect(mapStateToProps, mapDispatchToProps)(GraphDrawer);
})();

export default ReduxGraphDrawer;
