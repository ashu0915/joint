const Razorpay = require('razorpay');
const db = require('../config/db.js');
require('dotenv').config();
const axios = require('axios');
const API_URL = 'https://api.zwitch.io/v1/accounts';

exports.createGroup = async (req, res) => {
    const { name, members } = req.body;
    console.log(name);
    console.log(members);
    const admin_id = req.user.id;
    console.log(admin_id);
    try {
        // Check if group already exists
        db.query('SELECT id FROM `groups` WHERE name = ?', [name], (err, existingGroup) => {
            if (err) {
              console.log(err);
              return res.status(500).json({ error: 'Database error' });}
            if (existingGroup.length > 0) {
                return res.status(400).json({ error: 'Group with this name already exists' });
            }

            // Check if all users exist in the database
            db.query('SELECT id FROM users WHERE id IN (?)', [members], async (err, results) => {
                if (err) {
                  console.log(err);
                  return res.status(500).json({ error: 'Database error' });}

                if (results.length !== members.length) {
                  console.log("length error");
                    return res.status(400).json({ error: 'Some users do not exist' });
                }

                // Create Master Account (Virtual Account) for the Group based on admin details
                const adminQuery = 'SELECT name FROM users WHERE id = ?';
                db.query(adminQuery, [admin_id], async (err, adminResults) => {
                    if (err || adminResults.length === 0) {
                      console.log(err);
                      return res.status(500).json({ error: 'Admin user not found' });}

                    const adminName = adminResults[0].name;
                    console.log(`~${adminName}~`);
                    try {
                        console.log("Creating");
                        // const response = await axios.post(API_URL, {
                        //       "type": "virtual",
                        //       "used_as": "wallet",
                        //       "name": adminName,
                        //       "mobile_number": 7905630110,
                        //       "email": `${adminName}@example.com`,
                        //       "bank_name": idfc_bank,
                        //       "kyc": {
                        //         "state_code": "KA",
                        //         "city": "Bangalore",
                        //         "pan": "XXXXX2677X",
                        //         "postal_code": "560005",
                        //         "business_type": "individual",
                        //         "business_category": "law_firm"
                        //       }
                        //         }, { headers: {
                        //             Authorization: `Bearer ${process.env.OPEN_MONEY_BEARER_TOKEN}`,
                        //             'Content-Type': 'application/json'
                        //           } });
                        const options = {
                          method: 'POST',
                          url: 'https://api.zwitch.io/v1/accounts',
                          headers: {
                            accept: 'application/json',
                            'content-type': 'application/json',
                            Authorization: 'Bearer ak_test_TEq5SCqQOmLqXHBmR3uPqTl5H4IN2XeDZmFr:sk_test_qsz5Be8bRUxlRnv4nrOn17nwhnbiEwqx1F9t'
                          },
                          data: {type: 'virtual',
                              used_as: 'wallet',
                              name: adminName,
                              mobile_number: '7905630111',
                              email: `${adminName}@exam.com`,
                              bank_name: 'idfc_bank',
                              kyc: {
                                city: 'Bangalore',
                                postal_code: '560005',
                                state_code: 'KA',
                                business_type: 'partnership',
                                business_category: 'garage_owners',
                                contact_person: 'Rahul Reddy'
                              },
                              metadata: {key_1: 'DD', key_2: 'XOF'}
                            }
                        };
                        
                        axios.request(options).then((response)=>{
                          console.log("created");
                          const va = response.data;

                          // Store Group Details in Database with master account info
                          db.query('INSERT INTO `groups` (name, admin_id, virtual_account_id, wallet_balance, master_account, ifsc) VALUES (?, ?, ?, 0, ?, ?)',
                              [name, admin_id, va.id, va.account_number, va.ifsc_code], (err, result) => {
                                  if (err) {
                                    console.log(err);
                                    return res.status(500).json({ error: 'Database error' });}
      
                                  // Store group members in group_members table
                                  const groupId = result.insertId;
                                  const memberValues = members.map(memberId => [groupId, memberId]);
                                  memberValues.push([groupId, adminId]);
                                  db.query('INSERT INTO group_members (group_id, user_id) VALUES ?', [memberValues], (err) => {
                                      if (err) {
                                        console.log(err);
                                        return res.status(500).json({ error: 'Error inserting group members' });}
                                      res.json({ message: 'Group created', groupId, masterAccount: va.account_number });
                                    });
                              });
                            }).catch((error)=>{console.error("Zwitch API error:", error.response?.data || error.message);
                            });
                        
                    } catch(error){
                        console.log(error);
                        res.status(500).json({ error: error.response?.data || error.message });
                    }
                });
            });
        });
    } catch (error) {
        console.error(error.response?.data || error.message);
        res.status(500).json({ error: error.message });
    }
};



exports.fetchGroups = (req, res) => {
    const userId = req.user.id;
    console.log("Fetching group:",userId);
    const query = "SELECT g.id, g.name, g.wallet_balance, g.master_account, g.ifsc FROM `groups` g JOIN group_members gm ON g.id = gm.group_id WHERE gm.user_id = ?";
    console.log("hiii");
    db.query(query, [userId], async (err, groups) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ error: 'Database error' });}
      if (groups.length === 0) {
        console.log('User is not part of any groups');
        return res.status(404).json({ message: 'User is not part of any groups' });}
  
      // Fetch members for each group
      const groupDetails = await Promise.all(groups.map(group => {
        return new Promise((resolve, reject) => {
          const memberQuery = `
            SELECT u.id, u.name, u.phone
            FROM users u
            JOIN group_members gm ON u.id = gm.user_id
            WHERE gm.group_id = ?
          `;
  
          db.query(memberQuery, [group.id], (err, members) => {
            if (err) {
              console.log(err);
              return reject(err);}
  
            resolve({...group,members});
          });
        });
      }));

      res.json({ groups: groupDetails });
    });
  };
  