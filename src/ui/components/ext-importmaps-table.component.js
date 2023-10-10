import { h } from "preact";

export default function ExternalImportmapsTable(props) {
  const {
    brokenMaps,
    workingCurrentPageMaps,
    workingNextPageMaps,
    openDialogExternalMap,
  } = props;
  const hideTable =
    brokenMaps.length === 0 &&
    workingCurrentPageMaps.length === 0 &&
    workingNextPageMaps.length === 0;

  const reload = (evt) => {
    evt.stopPropagation();
    window.location.reload();
  };

  return hideTable ? null : (
    <table className="imo-overrides-table">
      <thead>
        <th>Import Map Status</th>
        <th>URL</th>
        <th>Action</th>
      </thead>
      <tbody>
        {brokenMaps.map((url) => (
          <tr
            role="button"
            tabIndex={0}
            onClick={() => openDialogExternalMap({ isNew: false, url })}
            key={url}
            className="imo-table-row-disabled-override"
          >
            <td>
              <div className="imo-status imo-disabled-override" />
              Invalid
            </td>
            <td>{url}</td>
            <td>
              <span className="imo-table-action" role="button">
                Override
              </span>
            </td>
          </tr>
        ))}
        {workingNextPageMaps.map((url) => (
          <tr
            role="button"
            tabIndex={0}
            onClick={() => openDialogExternalMap({ isNew: false, url })}
            key={url}
            className="imo-table-row-refresh-override"
          >
            <td>
              <div className="imo-status imo-refresh-override" />
              Pending refresh
            </td>
            <td>{url}</td>
            <td>
              <span className="imo-table-action" onClick={reload} role="button">
                Refresh to apply changes
              </span>
            </td>
          </tr>
        ))}
        {workingCurrentPageMaps.map((url) => (
          <tr
            role="button"
            tabIndex={0}
            onClick={() => openDialogExternalMap({ isNew: false, url })}
            key={url}
            className="imo-table-row-current-override"
          >
            <td>
              <div className="imo-status imo-current-override" />
              Override
            </td>
            <td>{url}</td>
            <td>
              <span className="imo-table-action" role="button">
                Override
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
