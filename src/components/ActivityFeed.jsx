import React, { useEffect, useState } from "react";
import { Button, ListGroupItem, Collapse, Table } from "react-bootstrap";
import { BsTelephoneInbound } from "react-icons/bs";
import { FcViewDetails } from "react-icons/fc";
import { HiArchive } from "react-icons/hi";
import { updateCallsArchiveStatus } from "../service/api";
import { VscCallOutgoing } from "react-icons/vsc";

const extractTime = (date) => {
  const timeString = date.substring(date.indexOf("T") + 1, date.indexOf("."));
  return timeString;
};

const extractDate = (timestamp) => {
  const dateString = timestamp.substring(0, timestamp.indexOf("T"));
  return dateString;
};

const callDirection = (direction) => {
  return direction === "inbound" ? (
    <BsTelephoneInbound color="green" size={20} className="mr-3" />
  ) : (
    <VscCallOutgoing size={24} color="blue" className="mr-3" />
  );
};

const ActivityFeed = ({ calls, isArchived, refreshCalls, activeKey }) => {
  const [expandedItem, setExpandedItem] = useState(null);
  const [showButtons, setShowButtons] = useState(null);

  useEffect(() => {
    setExpandedItem(null);
    setShowButtons(null);
  }, [activeKey]);
  const handleUpdateCallsStatus = (archive) => {
    const callIds = calls.map((call) => call.id);
    updateCallsArchiveStatus(callIds, archive)
      .then(() => {
        refreshCalls();
      })
      .catch((error) => {
        console.error(
          `Error ${archive ? "archiving" : "unarchiving"} calls:`,
          error
        );
      });
  };

  const toggleDetails = (callId) => {
    if (expandedItem === callId) {
      setExpandedItem(null); // Collapse if already expanded
    } else {
      setExpandedItem(callId); // Expand the clicked item
    }
  };

  const toggleButtons = (callId) => {
    setShowButtons(showButtons === callId ? null : callId);
    if (!showButtons) {
      setExpandedItem(null); // Collapse details if buttons are shown
    }
  };

  const handleArchiveToggle = (callId) => {
    // Find the call object by callId
    const callToUpdate = calls.find((call) => call.id === callId);

    // Update the is_archived status (toggle between true and false)
    const updatedCall = {
      ...callToUpdate,
      is_archived: !callToUpdate.is_archived,
    };

    // Call your API to update the call's archive status
    updateCallsArchiveStatus([callId], updatedCall.is_archived)
      .then(() => {
        // Refresh the calls list
        refreshCalls();
      })
      .catch((error) => {
        console.error("Error toggling archive for call:", error);
      });
  };

  const handleUnarchive = (callId) => {
    // Call your API to unarchive the call
    updateCallsArchiveStatus([callId], false) // Assuming your API accepts `false` to unarchive
      .then(() => {
        // Refresh the calls list
        refreshCalls();
      })
      .catch((error) => {
        console.error("Error unarchiving call:", error);
      });
  };

  return (
    <div>
      <ul className="list-group">
        {calls?.length > 0 &&
          calls.map((call) => (
            <React.Fragment key={call.id}>
              {!isArchived && !call.is_archived && (
                <ListGroupItem
                  className="callCard d-flex justify-content-between align-items-center border rounded-lg p-3 mt-2"
                  aria-expanded={expandedItem === call.id}
                  aria-controls="example-collapse-text"
                  onClick={() => toggleButtons(call.id)}
                  style={{ cursor: "pointer" }}
                >
                  {callDirection(call.direction)}
                  {call.from}
                  <span className="text-muted">
                    {extractTime(call.created_at)}
                  </span>
                </ListGroupItem>
              )}

              {(isArchived || call.is_archived) && (
                <ListGroupItem
                  className="callCard d-flex justify-content-between align-items-center border rounded-lg p-3 mt-2"
                  aria-expanded={expandedItem === call.id}
                  aria-controls="example-collapse-text"
                  onClick={() => toggleButtons(call.id)}
                  style={{ cursor: "pointer", backgroundColor: "#ededed" }}
                >
                  {callDirection(call.direction)}
                  {call.from}
                  <span className="text-muted">
                    {extractTime(call.created_at)}
                  </span>
                </ListGroupItem>
              )}

              {showButtons === call.id && (
                <div className="d-flex justify-content-center">
                  <Button
                    className="btn btn-light m-2"
                    onClick={() => toggleDetails(call.id)}
                  >
                    Details <FcViewDetails />
                  </Button>
                  {isArchived || call.is_archived ? (
                    <Button
                      className="btn btn-light m-2"
                      onClick={() => handleUnarchive(call.id)}
                    >
                      Unarchive <HiArchive color="#6495ED" />
                    </Button>
                  ) : (
                    <Button
                      className="btn btn-light m-2"
                      onClick={() => handleArchiveToggle(call.id)}
                    >
                      Archive <HiArchive color="#6495ED" />
                    </Button>
                  )}
                </div>
              )}

              <Collapse in={expandedItem === call.id}>
                <div key={call.id} className="card card-body mt-2">
                  <Table className="table table-borderless">
                    <tbody>
                      <tr>
                        <td>{`${call.call_type.toUpperCase()} Call`}</td>
                        <td>{`From: ${call.from}`}</td>
                        <td>{`To: ${call.to}`}</td>
                      </tr>
                      <tr>
                        <td>{`Date: ${extractDate(call.created_at)}`}</td>
                        <td colSpan={2}>{`Time: ${extractTime(
                          call.created_at
                        )}`}</td>
                      </tr>
                      <tr>
                        <td>{`Call duration: ${call.duration} minutes`}</td>
                        <td colSpan={2}>{`Archived: ${call.is_archived}`}</td>
                      </tr>
                    </tbody>
                  </Table>
                </div>
              </Collapse>
            </React.Fragment>
          ))}
      </ul>
      <div className="text-center mt-3">
        <Button
          variant="primary"
          onClick={() => handleUpdateCallsStatus(!isArchived)}
          disabled={calls.length === 0}
        >
          {isArchived ? "Unarchive All Calls" : "Archive All Calls"}
        </Button>
      </div>
    </div>
  );
};

export default ActivityFeed;
