

// import { SPHttpClient } from '@microsoft/sp-http';
// import { WebPartContext } from '@microsoft/sp-webpart-base';
// import * as React from 'react';
//  import styles from './CustomNewsTicker.module.scss'
// export interface ICustomNewsTickerProps {
//   context: WebPartContext;
// }
 
// export interface IActivity {
//   title: string;
//   activityType: string;
//   modifiedBy: string;
//   modifiedDate: string;
// }
 
// export default class LatestActivity extends React.Component<ICustomNewsTickerProps, { latestActivity: IActivity | null }> {
//   constructor(props: ICustomNewsTickerProps) {
//     super(props);
 
//     this.state = {
//       latestActivity: null
//     };
//   }
 
//   public componentDidMount() {
//     this.fetchLatestActivity();
//   }
 
//   private async fetchLatestActivity() {
//     const apiUrl = `${this.props.context.pageContext.web.absoluteUrl}/_api/search/query?querytext='*'
// &selectproperties='Title,FileType,LastModifiedTime,EditorOWSUser'
// &rowlimit=1
// &sortlist='LastModifiedTime:descending'`;
 
//     try {
//       const response = await this.props.context.spHttpClient.get(apiUrl, SPHttpClient.configurations.v1);
//       if (response.ok) {
//         const data = await response.json();
//         if (data.PrimaryQueryResult.RelevantResults.RowCount > 0) {
//           const result = data.PrimaryQueryResult.RelevantResults.Table.Rows[0];
//           const activity: IActivity = {
//             title: result.Cells.find((cell: any) => cell.Key === 'Title').Value,
//             activityType: result.Cells.find((cell: any) => cell.Key === 'FileType').Value,
//             modifiedBy: result.Cells.find((cell: any) => cell.Key === 'EditorOWSUser').Value,
//             modifiedDate: result.Cells.find((cell: any) => cell.Key === 'LastModifiedTime').Value
//           };
//           this.setState({ latestActivity: activity });
//         } else {
//           console.log('No activity found.');
//         }
//       } else {
//         console.error(`Failed to fetch latest activity: ${response.statusText}`);
//       }
//     } catch (error) {
//       console.error('Error fetching latest activity:', error);
//     }
//   }
 
//   public render(): React.ReactElement<ICustomNewsTickerProps> {
//     const { latestActivity } = this.state;
 
//     return (
// <div className={styles.latestActivity}>
// <h2>Latest Activity</h2>
//         {latestActivity ? (
// <div>
// <p>{latestActivity.modifiedBy} has modified the {latestActivity.activityType}: <strong>{latestActivity.title}</strong></p>
// <p>Last Modified: {new Date(latestActivity.modifiedDate).toLocaleString()}</p>
// </div>
//         ) : (
// <p>No activity found.</p>
//         )}
// </div>
//     );
//   }
// }






import { WebPartContext } from '@microsoft/sp-webpart-base';
import { sp } from '@pnp/sp';
import { ICustomNewsTickerProps } from './ICustomNewsTickerProps';
import styles from './CustomNewsTicker.module.scss'

export default class CustomNewsTicker extends BaseClientSideWebPart<ICustomNewsTickerProps> {
 
  public async render(): Promise<void> {
    this.domElement.innerHTML = `
    <div className="${styles.recentActivities}">
      <h2>Recent Activities</h2>
      <ul id="activitiesList"></ul>
    </div>`;
    
 
    const activitiesList = this.domElement.querySelector('#activitiesList');
 
    try {
      const recentActivities = await this.getRecentSiteActivities();
      recentActivities.forEach(activity => {
        const listItem = document.createElement('li');
        listItem.innerText = `${activity.Title} - ${activity.Author.Title}`;
        activitiesList.appendChild(listItem);
      });
    } catch (error) {
      console.error('Error fetching recent activities:', error);
    }
  }
 
  private async getRecentSiteActivities(): Promise<any[]> {
    try {
      const activities = await sp.site.root.web.getSiteUserInfoList().items
        .select('Title', 'Modified', 'Author/Title')
        .expand('Author')
        .orderBy('Modified', false)
        .top(5)
        .get();
      return activities;
    } catch (error) {
      throw error;
    }
  }
}