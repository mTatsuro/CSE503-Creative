import React from 'react';
import Highlight from './Highlight';

const HighList = ({highList, handleToggle}) => {
    return (
        <div class="highlist">
            {highList.map(highlight => {
                return (
                    <Highlight highlight={highlight} handleToggle={handleToggle}/>
                )
            })}
        </div>
    );
};

export default HighList;
