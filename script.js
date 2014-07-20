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
  toggleSave: function() {
    var localEps = JSON.parse(localStorage.getItem('episodes'));
    var watchedState = this.state.episode.watched === 'true' ? 'false' : 'true';
    localEps[this.props.seasonNo].episodes[this.state.episode.episode -1].watched = watchedState;
    localStorage.setItem('episodes', JSON.stringify(localEps));
    var ep = this.state.episode;
    ep.watched = watchedState;
    this.setState({episode: ep});
  },
  render: function() {
    return (
      <li className={'episode watched-' + this.state.episode.watched} key={this.props.key}>
        <div className="media">
          <div className="pull-left">
            <div className='watched' onClick={this.toggleSave}><span className={'glyphicon glyphicon-' + this.state.episode.watched}></span></div>
          </div>
          <div className="media-body">
            <div className="media-heading">
              <small>Episode {this.state.episode.episode}</small>
              <h3><a href={this.state.episode.title.href}>{this.state.episode.title.text}</a> </h3>
            </div>
            <Rating val={this.state.episode.rating} />
          </div>
        </div>
      </li>
    )
  }
});

var Rating = React.createClass({
  getInitialState: function() {
    return {
      ratingState: this.setRatingClass()
    }
  },
  setRatingClass: function() {
    var rating = parseFloat(this.props.val);
    return rating >= 8 ? 'high' : 'med';
  },
  render: function() {
    return (
      <span className={'rating rating-' + this.state.ratingState}>{this.props.val}</span>
    )
  }
});

React.renderComponent(
  <Seasons url="episodes.json" />,
  document.getElementById('container')
);