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


  mapping ( uint64 => Weet ) backend_to_weet;
  mapping ( uint64 => mapping ( uint64 => Weet ) ) weeter_to_weet;
  mapping ( uint64 => uint32 ) public weeter_stat;

  address public address_admin = msg.sender;
  uint64 public weet_count = 0;
  uint64[] public weets;

  modifier only_admin() {
    require(msg.sender == address_admin);
    _;
  }

  function upload_weet(uint64 _b_weet_id, uint64 _b_weeter_id, uint64 _timestamp, string _weet) external only_admin {
    require(backend_to_weet[_b_weet_id].weeter_id == 0);
    bytes32 checksum = get_checksum(_b_weeter_id, _timestamp, _weet);
    weeter_to_weet[_b_weeter_id][_b_weet_id] = Weet(false, _b_weeter_id, _timestamp, checksum, _weet);
    backend_to_weet[_b_weet_id] = weeter_to_weet[_b_weeter_id][_b_weet_id];
    weeter_stat[_b_weeter_id]++;
    weets.push(_b_weet_id);
    weet_count++;

    emit WeetCreated(_b_weet_id, _b_weeter_id);
  }

  function get_weet(uint64 _b_weet_id) external view returns(uint64, uint64, uint64, string, bool) {
    Weet memory weet = backend_to_weet[_b_weet_id];
    return(_b_weet_id, weet.weeter_id, weet.timestamp, weet.content, weet.is_published);
  }

  function validate_weet(uint64 _b_weet_id, uint64 _b_weeter_id, uint64 _timestamp, string _weet) public view returns(bool) {
    bytes32 checksum = backend_to_weet[_b_weet_id].checksum;
    bytes32 compare = get_checksum(_b_weeter_id, _timestamp, _weet);

    return checksum == compare;
  }

  function publish_weet(uint64 _b_weet_id, uint64 _b_weeter_id, uint64 _timestamp, string _weet) external only_admin {
    require(validate_weet(_b_weet_id, _b_weeter_id, _timestamp, _weet) == true);
    Weet storage weet = backend_to_weet[_b_weet_id];
    weet.is_published = true;
    //backend_to_weet[_b_weet_id].is_published = true;
    emit WeetPublished(_b_weet_id, _b_weeter_id);
  }

  function get_checksum(uint64 _weeter_id, uint64 _timestamp, string _weet) pure internal returns(bytes32){
    return keccak256(abi.encodePacked(_weeter_id, _timestamp, _weet));
  }

  
}