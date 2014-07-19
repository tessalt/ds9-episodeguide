/** @jsx React.DOM */
var Seasons = React.createClass({
  getInitialState: function() {
    return {data: []};
  },
  loadSeasonsFromServer: function() {
    var localEps = localStorage.getItem('episodes');
    if (!localEps) {
      console.log('ajax');
      $.ajax({
        url: this.props.url,
        success: function(data) {
          localStorage.setItem('episodes', JSON.stringify(data));
          this.setState({data: data});
        }.bind(this),
      });
    } else {
      console.log('local');
      console.log(JSON.parse(localEps));
      this.setState({data: JSON.parse(localEps)});
    }
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
    // console.log(this.props.seasons);
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
    this.setState({filteredEps: picked});
  },
  render: function() {
    var key = this.props.key;
    var epNodes = this.state.filteredEps.map(function (ep, index){
      return (
        <Episode key={index} data={ep} seasonNo={key} />
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

var Episode = React.createClass({
  getInitialState: function() {
    return {episode: this.props.data}
  },
  saveEp: function() {
    var localEps = JSON.parse(localStorage.getItem('episodes'));
    localEps[this.props.seasonNo].episodes[this.state.episode.episode -1].watched = "true";
    localStorage.setItem('episodes', JSON.stringify(localEps));
    var ep = this.state.episode;
    ep.watched = 'true';
    this.setState({episode: ep});
  },
  render: function() {
    return (
      <li className="episode" key={this.props.key}>
        {this.state.episode.watched}
        <button onClick={this.saveEp}>Save</button>
        <header>
          <h3><a href={this.state.episode.title.href}>{this.state.episode.title.text}</a> <small>Rating: {this.state.episode.rating}</small></h3>
          <p>{this.state.episode.episode}</p>
        </header>
      </li>
    )
  }
});

React.renderComponent(
  <Seasons url="episodes.json" />,
  document.getElementById('container')
);