import { connect } from 'react-redux';
import NodeTooltip from './NodeTooltip';

const ReduxNodeTooltip = (() => {
  const mapStateToProps = state => ({
    hoveringNode: state.ddgraph.hoveringNode,
    hoveringNodeSVGElement: state.ddgraph.hoveringNodeSVGElement,
    svgCTM: state.ddgraph.svgCTM,
    canvasBoundingRect: state.ddgraph.canvasBoundingRect,
  });

  return connect(mapStateToProps)(NodeTooltip);
})();

export default ReduxNodeTooltip;

