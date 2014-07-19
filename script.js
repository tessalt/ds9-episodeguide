/** @jsx React.DOM */
var Seasons = React.createClass({
  getInitialState: function() {
    return {data: []};
  },
  loadSeasonsFromServer: function() {
    $.ajax({
      url: this.props.url,
      success: function(data) {
        this.setState({data: data});
      }.bind(this)
    });
  },
  componentWillMount: function() {
    this.loadSeasonsFromServer();
  },
  render: function() {
    return (
      <div class="seasons">
        <SeasonList data={this.state.data} />
      </div>
    )
  }
});

var SeasonList = React.createClass({
  render: function() {
    var seasonNodes = this.props.data.map(function (season, index) {
      return (
        <div className="seasonList">
          <h3>Season {index + 1}</h3>
          <EpisodeList key={index} season={season} />
        </div>
      )
    });
    return <div className="seasonList">{seasonNodes}</div>;
  }
});

var EpisodeList = React.createClass({
  render: function() {
    var episodes = this.props.season.map(function (ep, index) {
      return (
        <li>
          <p>{ep.title.text}</p>
        </li>
      )
    });
    return <ul>{episodes}</ul>;
  }
});

React.renderComponent(
  <Seasons url="/episodes.json" />,
  document.getElementById('container')
);