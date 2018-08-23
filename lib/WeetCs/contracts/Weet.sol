pragma solidity ^0.4.24;

contract WeetFactory {
  event WeetCreated(uint64 weet_id, uint64 weeter_id);
  event WeetPublished(uint64 weet_id, uint64 weeter_id);

  struct Weet {
    bool is_published;
    uint64 weeter_id;
    uint64 timestamp;
    bytes32 checksum;
    string content;
  }


  mapping ( uint256 => Weet ) backend_to_weet;
  mapping ( uint256 => mapping ( uint256 => Weet ) ) weeter_to_weet;
  mapping ( uint256 => uint32 ) public weeter_stat;

  address public address_admin = msg.sender;

  modifier only_admin() {
    require(msg.sender == address_admin);
    _;
  }

  function upload_weet(uint64 _b_weet_id, uint64 _b_weeter_id, uint64 _timestamp, string _weet) external only_admin {
    bytes32 checksum = get_checksum(_b_weeter_id, _timestamp, _weet);
    weeter_to_weet[_b_weeter_id][_b_weet_id] = Weet(false, _b_weeter_id, _timestamp, checksum, _weet);
    backend_to_weet[_b_weet_id] = weeter_to_weet[_b_weeter_id][_b_weet_id];
    weeter_stat[_b_weeter_id]++;

    emit WeetCreated(_b_weet_id, _b_weeter_id);
  }

  function get_weet(uint64 _b_weet_id) external view returns(uint64, uint64, string, bool) {
    Weet memory weet = backend_to_weet[_b_weet_id];
    return(weet.weeter_id, weet.timestamp, weet.content, weet.is_published);
  }

  function validate_weet(uint64 _b_weet_id, uint64 _b_weeter_id, uint64 _timestamp, string _weet) public view returns(bool) {
    bytes32 checksum = backend_to_weet[_b_weet_id].checksum;
    bytes32 compare = get_checksum(_b_weeter_id, _timestamp, _weet);

    return checksum == compare;
  }

  function publish_weet(uint64 _b_weet_id, uint64 _b_weeter_id, uint64 _timestamp, string _weet) external only_admin {
    require(validate_weet(_b_weet_id, _b_weeter_id, _timestamp, _weet));
    backend_to_weet[_b_weet_id].is_published = true;
    emit WeetPublished(_b_weet_id, _b_weeter_id);
  }

  function get_checksum(uint64 _weeter_id, uint64 _timestamp, string _weet) pure internal returns(bytes32){
    return keccak256(abi.encodePacked(_weeter_id, _timestamp, _weet));
  }

  
}