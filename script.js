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
      }.bind(this),
    });
  },
  componentWillMount: function() {
    this.loadSeasonsFromServer();
  },
  render: function() {
    return (
      <div className="seasonList">
        <SeasonList picks={this.state.picks} seasons={this.state.data} />
      </div>
    )
  }
});

var SeasonList = React.createClass({
  getInitialState: function() {
    return {seasons: []}
  },
  loadPicks: function(cb){
    $.ajax({
      url: 'picks.json',
      success: function(data) {
        cb(data);
      }.bind(this),
    });
  },
  componentWillMount: function() {
    this.loadPicks(function(picks){
      var seasons = [];
      $.each(this.props.seasons, function(index, season){
        var seasonPicks = picks[index];
        var seasonObj = {
          episodes: season.episodes,
          picks: picks[index].episodes
        }
        seasons.push(seasonObj);
      });
      this.setState({seasons: seasons})
    }.bind(this));
  },
  render: function() {
    var seasonNodes = this.state.seasons.map(function (season, index) {
      return (
        <Season key={index} data={season} />
      )
    });
    return <div>{seasonNodes}</div>;
  }
});

var Season = React.createClass({
  getInitialState: function() {
    return {filteredEps: []}
  },
  componentWillMount: function() {
    var episodes = this.props.data.episodes;
    var picked = this.props.data.picks.map(function(pick, index){
      return episodes[pick - 1];
    }.bind(this));
    console.log(picked);
    this.setState({filteredEps: picked});
  },
  render: function() {
    var epNodes = this.state.filteredEps.map(function (ep, index){
      return (
        <li className="episode" key={index}>
          <header>
            <h3><a href={ep.title.href}>{ep.title.text}</a> <small>Rating: {ep.rating}</small></h3>
            <p>{ep.episode}</p>
          </header>
        </li>
      )
    });
    return (
      <div className="season">
        <h2>Season {this.props.key + 1}</h2>
        <ul className="episodes">{epNodes}</ul>
      </div>
    )
  }
});

React.renderComponent(
  <Seasons url="/episodes.json" />,
  document.getElementById('container')
);