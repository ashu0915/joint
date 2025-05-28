import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';


function Payment(){
    
    return(
        <div>
            <div>
                <header>Humara</header>
            </div>
            <br />
            <form>
                <input type="text" name="merchant_upi" />
                <br />
                <input type="text" name="amount" />
                <button type='submit'></button>
            </form>
        </div>
    );
}

export default Payment;