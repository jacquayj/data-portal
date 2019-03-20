import React from 'react';
import PropTypes from 'prop-types';
import GuppyWrapper from '@gen3/guppy/dist/components/GuppyWrapper';
import ConnectedFilter from '@gen3/guppy/dist/components/ConnectedFilter';
import ExplorerVisualization from './ExplorerVisualization';
import './GuppyDataExplorer.css';

class Explorer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      aggsData: {},
      filter: {},
    };
  }

  handleReceiveNewAggsData = (newAggsData, filter) => {
    this.setState({ aggsData: newAggsData });
  }

  render() {
    return (
      <div className='guppy-data-explorer'>
        <GuppyWrapper
          filterConfig={this.props.filterConfig}
          guppyConfig={this.props.guppyConfig}
          onReceiveNewAggsData={this.handleReceiveNewAggsData}
        >
          <ConnectedFilter className='guppy-data-explorer__filter' />
          <ExplorerVisualization
            className='guppy-data-explorer__visualization'
            aggsData={this.state.aggsData}
            filter={this.props.filter}
            chartConfig={this.props.chartConfig}
            tableConfig={this.props.tableConfig}
          />
        </GuppyWrapper>
      </div>
    );
  }
}

Explorer.propTypes = {
  guppyConfig: PropTypes.shape({
    path: PropTypes.string,
    type: PropTypes.string,
  }).isRequired,
  filterConfig: PropTypes.shape({
    tabs: PropTypes.arrayOf(PropTypes.shape({
      title: PropTypes.string,
      filters: PropTypes.arrayOf(PropTypes.shape({
        field: PropTypes.string,
        label: PropTypes.string,
      })),
    })),
  }).isRequired,
  tableConfig: PropTypes.arrayOf(PropTypes.shape({
    field: PropTypes.string,
    name: PropTypes.string,
  })).isRequired,
  chartConfig: PropTypes.object.isRequired,
};

Explorer.defaultProps = {
};

export default Explorer;
