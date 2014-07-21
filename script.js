/** @jsx React.DOM */
var Seasons = React.createClass({
  getInitialState: function() {
    return {data: []};
  },
  loadSeasonsFromServer: function() {
    var localEps = localStorage.getItem('episodes');
    if (!localEps) {
      $.ajax({
        url: this.props.url,
        success: function(data) {
          localStorage.setItem('episodes', JSON.stringify(data));
          //this.setState({data: data});
          this.setState({data: JSON.parse(localEps)});
        }.bind(this)
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
      url: 'data/picks.json',
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
          open: season.open,
          episodes: season.episodes,
          picks: picks[index]
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
    return {
      filteredEps: [],
      display: this.props.data.open
    }
  },
  componentWillMount: function() {
    var episodes = this.props.data.episodes;
    var picked = this.props.data.picks.map(function(pick, index){
      return episodes[pick - 1];
    }.bind(this));
    this.setState({filteredEps: picked});
  },
  toggleDisplay: function() {
    var localEps = JSON.parse(localStorage.getItem('episodes'));
    localEps[this.props.key].open = !this.state.display;
    localStorage.setItem('episodes', JSON.stringify(localEps));
    var el = this.refs.seasonUl.getDOMNode();
    $(el).slideToggle('medium', function(){
      this.setState({display: !this.state.display});
    }.bind(this));
  },
  render: function() {
    var key = this.props.key;
    var epNodes = this.state.filteredEps.map(function (ep, index){
      return (
        <Episode key={index} data={ep} seasonNo={key} />
      )
    });
    var displayClass = this.state.display ? 'open' : 'closed';
    var iconClass = this.state.display ? 'minus' : 'plus';
    return (
      <div className="season">
        <h2 onClick={this.toggleDisplay}>
          Season {this.props.key + 1}
          <span className={"glyphicon glyphicon-" + iconClass}></span>
        </h2>
        <ul ref="seasonUl" className={"episodes " + displayClass}>{epNodes}</ul>
      </div>
    )
  }
});

var Episode = React.createClass({
  getInitialState: function() {
    return {
      episode: this.props.data,
      showDesc: false
    }
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
  showDesc: function() {
    this.setState({showDesc: !this.state.showDesc});
  },
  render: function() {
    var displayClass = this.state.showDesc ? 'open' : 'closed';
    return (
      <li className={'episode watched-' + this.state.episode.watched} key={this.props.key}>
        <div className="media">
          <div className="pull-left">
            <div className='watched' onClick={this.toggleSave}>
              <WatchedIndicator watched={this.state.episode.watched} />
            </div>
          </div>
          <div className="media-body"  onClick={this.showDesc}>
            <div className="media-heading">
              <small>Episode {this.state.episode.episode}</small>
              <h3>{this.state.episode.title.text}</h3>
            </div>
            <Rating val={this.state.episode.rating} />
          </div>
          <Description
            display={displayClass}
            notes={this.state.episode.notes}
            content={this.state.episode.description}
            link={this.state.episode.title.href} />
        </div>
      </li>
    )
  }
});

var Description = React.createClass({
  render: function() {
    return (
      <div className={'description ' + this.props.display}>
        <p>{this.props.content}</p>
        <p><strong>{this.props.notes ? 'Notes: ' : ''}</strong>{this.props.notes}</p>
        <p><a target="_blank" href={this.props.link}>View full description</a></p>
      </div>
    )
  }
});

var WatchedIndicator = React.createClass({
  render: function() {
    var iconClass = this.props.watched === 'true' ? 'ok' : 'unchecked';
    return (
      <span className={'glyphicon glyphicon-' + iconClass}></span>
    )
  }
});

var Rating = React.createClass({
  render: function() {
    var rating = parseFloat(this.props.val);
    var ratingClass = rating >= 8 ? 'high' : 'med';
    return (
      <span className={'rating rating-' + ratingClass}>{this.props.val}</span>
    )
  }
});

React.renderComponent(
  <Seasons url="data/episodes.json" />,
  document.getElementById('container')
);