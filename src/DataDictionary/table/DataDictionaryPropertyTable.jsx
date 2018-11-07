import React from 'react';
import PropTypes from 'prop-types';
import './DataDictionaryPropertyTable.css';

/**
 * Little helper to extract the type for some dictionary node property.
 * Export just for testing.
 * @param {Object} property one of the properties of a dictionary node
 * @return {String|Array<String>} string for scalar types, array for enums
 *                   and other listish types or 'UNDEFINED' if no
 *                   type information availabale
 */
export const getType = (property) => {
  let type = 'UNDEFINED';
  if ('type' in property) {
    if (typeof property.type === 'string') {
      type = property.type;
    } else {
      type = property.type;
    }
  } else if ('enum' in property) {
    type = property.enum;
  } else if ('oneOf' in property) {
    // oneOf has nested type list - we want to flatten nested enums out here ...
    type = property.oneOf
      .map(item => getType(item))
      .reduce(
        (flatList, it) => {
          if (Array.isArray(it)) {
            return flatList.concat(it);
          }
          flatList.push(it);
          return flatList;
        }, [],
      );
  } else {
    type = 'UNDEFINED';
  }

  return type;
};

class DataDictionaryPropertyTable extends React.Component {
  render() {
    return (
      <div className='data-dictionary-property-table'>
        <i className='' />
        <span className='data-dictionary-property-table__close' onClick={this.props.onClose}>
          Close tab
          <i className='g3-icon g3-icon--cross data-dictionary-property-table__close-icon' />
        </span>
        <div className='data-dictionary-property-table__summary'>
          <span>{this.props.nodeName}</span>
          <span> has </span>
          <span>{Object.keys(this.props.properties).length}</span>
          <span> properties. </span>
        </div>
        <table className='data-dictionary-property-table__table'>
          <thead className='data-dictionary-property-table__head'>
            <tr className='data-dictionary-property-table__row'>
              <td className='data-dictionary-property-table__data'>Property</td>
              <td className='data-dictionary-property-table__data'>Type</td>
              <td className='data-dictionary-property-table__data'>Required</td>
              <td className='data-dictionary-property-table__data'>Description</td>
              <td className='data-dictionary-property-table__data'>Term</td>
            </tr>
          </thead>
          <tbody>
            {
              Object.keys(this.props.properties).map((propertyKey) => {
                const property = this.props.properties[propertyKey];
                const type = getType(property);
                let rawDescription = 'No Description';
                if ('description' in property) {
                  rawDescription = property.description;
                }
                if ('term' in property) {
                  rawDescription = property.term.description;
                }
                const descriptionElements = (
                  <React.Fragment>
                    {
                      rawDescription &&
                      rawDescription.split('\\n').map((desc, i) => (
                        <span key={`${propertyKey}-desc-${i}`} className='data-dictionary__description-para'>
                          {desc}
                        </span>
                      ))
                    }
                  </React.Fragment>
                );
                return (
                  <tr key={propertyKey}>
                    <td className='data-dictionary-property-table__data'>{propertyKey}</td>
                    <td className='data-dictionary-property-table__data'>
                      <ul>
                        {
                          typeof type === 'string' ? (<li>{type}</li>) : type.map(t => (
                            <li key={t}>{t}</li>
                          ))
                        }
                      </ul>
                    </td>
                    <td className='data-dictionary-property-table__data'>{this.props.requiredProperties.includes(propertyKey) ? 'True' : 'False'}</td>
                    <td className='data-dictionary-property-table__data'>{descriptionElements}</td>
                    <td className='data-dictionary-property-table__data' />
                  </tr>
                );
              })
            }

          </tbody>
        </table>
      </div>
    );
  }
}

DataDictionaryPropertyTable.propTypes = {
  nodeName: PropTypes.string.isRequired,
  properties: PropTypes.object.isRequired,
  requiredProperties: PropTypes.array,
  onClose: PropTypes.func,
};

DataDictionaryPropertyTable.defaultProps = {
  requiredProperties: [],
  onClose: () => {},
};

export default DataDictionaryPropertyTable;
