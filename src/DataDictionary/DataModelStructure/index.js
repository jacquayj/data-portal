import { connect } from 'react-redux';
import { setGraphView, setOverlayPropertyTableHidden, setNeedReset } from '../action.js';
import DataModelStructure from './DataModelStructure';

const ReduxDataModelStructure = (() => {
  const mapStateToProps = state => ({
    dataModelStructure: state.ddgraph.dataModelStructure,
    isGraphView: state.ddgraph.isGraphView,
  });

  const mapDispatchToProps = dispatch => ({
    onSetGraphView: isGraphView => dispatch(setGraphView(isGraphView)),
    onOpenOverlayPropertyTable: () => dispatch(setOverlayPropertyTableHidden(false)),
    onResetGraphCanvas: () => dispatch(setNeedReset(true)),
  });

  return connect(mapStateToProps, mapDispatchToProps)(DataModelStructure);
})();

export default ReduxDataModelStructure;
