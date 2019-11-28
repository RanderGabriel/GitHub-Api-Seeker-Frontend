import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import axios from 'axios'
import Chart from 'chart.js'

function Menu({ onClickRepo, onClickRank, onClickProfile, onClickGraph }) {
  return (
    <div className="Menu col">
      <h2 className="Menu-title"> Queries</h2>
      <div className="Query-button" onClick={onClickRepo}>
        Buscar repositórios de um usuário
        <i className="fas fa-chevron-right"></i>
      </div>
      <div className="Query-button" onClick={onClickRank}>
        Linguagens TOP por ano
        <i className="fas fa-chevron-right"></i>
      </div>
      <div hidden={true} className="Query-button" onClick={onClickProfile}>
        Buscar informações de um usuário
        <i className="fas fa-chevron-right"></i>
      </div>
      <div className="Query-button" onClick={onClickGraph}>
        Projetos criados por mês / ano
        <i className="fas fa-chevron-right" ></i>
      </div>

    </div>

  )
}

function Item({ data }) {
  return (
    <div className="Item">
      <div style={{ fontSize: '1.2em' }}>{data.name}</div>
      <div style={{ fontSize: '0.8em' }}>{data.description}</div>
    </div>);
}

class Ranking extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      text: "",
    }
  }


  render() {
    return (
      <div>
        <h3>Buscar ranking de linguagens (insira o ano)</h3>

        <form onSubmit={(evt) => {
          evt.preventDefault();
          this.props.onSubmit(this.state.text)
        }}>
          <input type="text" onChange={(evt) => this.setState({ text: evt.target.value })} />
          <button onClick={(evt) => {
            evt.preventDefault();
            this.props.onSubmit(this.state.text)
          }
          }>Buscar</button>
        </form>
        {this.props.data && this.props.data.length > 0 &&
          <div>
            <h3>Top linguagens de {this.state.text}</h3>
            <table className="table-dark">
              <tr scope="col">
                <td>Projetos criados</td>
                <td>Linguagem</td>
              </tr>
              <tbody>
                {this.props.data.map(el => (
                  <tr scope="col">
                    <td>{el.projects_count}</td>
                    <td>{el.language}</td>
                  </tr>
                ))}
              </tbody>

            </table>
          </div>}
      </div>

    )
  }
}

function ProjectsForUser({ data, onSubmit }) {
  const [text, setText] = useState("")
  const onClick = (evt) => {
    evt.preventDefault();
    onSubmit(text);
  }

  const updateText = (evt) => {
    setText(evt.target.value)
  }
  return (<div>
    <h3>Buscar repositórios de um usuário</h3>
    <form action="">
      <input className="FormInput" value={text} onChange={updateText} /><button onClick={onClick} className="FormButton">Buscar</button>
    </form>

    {data.map((el) => (
      <Item data={el} />))}
  </div>)
}

function UserProfile({ data, onSubmit }) {
  const [text, setText] = useState("");

  console.log(text);
  return (
    <>
      <h3>Buscar informações de um usuário</h3>
      <form onSubmit={(evt) => {
        evt.preventDefault();
        onSubmit(text)
      }}>
        <input onChange={(evt) => setText(evt.target.value)}></input>
        <button onClick={(evt) => onSubmit(text)}>Buscar</button>
      </form>
      <div>
        {data.name}
      </div>
    </>
  );
}

class LineGraph extends React.Component {

  constructor(props) {
    super(props);
    this.myRef = React.createRef();
    this.state = { chart: undefined }
  }
  componentDidMount() {
    this.props.onSubmit();
  }

  render() {
    const ctx = this.myRef.current;
    if (!this.state.chart && this.props.data != null && this.props.data.length > 0) {
      this.setState({
        chart: new Chart(ctx, {
          type: 'line',
          data: {
            labels: this.props.data.map(el => el.month_year),
            datasets: [{
              label: 'Projetos criados',
              backgroundColor: 'rgb(255, 99, 132)',
              borderColor: 'rgb(255, 99, 132)',
              data: this.props.data.map(el => el.amount)
            }]
          },
          options: {}
        })
      });
    }
    return (<canvas ref={this.myRef} id="myChart"></canvas>)
  }

}

function App() {
  //const [data, setData] = useState([])
  const [rank, setRank] = useState([]);
  const [profile, setProfile] = useState([]);
  const [repos, setRepos] = useState([]);
  const [toRender, setToRender] = useState("");
  const [graph, setGraph] = useState([]);
  const [loading, setLoading] = useState(false);

  const onSubmitGraph = async () => {
    setLoading(true);
    const response = await axios.get("https://localhost:44396/api/users/stats");
    setLoading(false);
    setGraph(response.data);
  }

  const onSubmitProjects = async (text) => {
    setLoading(true);
    const response = await axios.get("https://localhost:44396/api/users/projects?login=" + text);
    setLoading(false);
    setRepos(response.data.map(el => ({ ...el, key: el.id })))
  }

  const onSubmitProfile = async (text) => {
    setLoading(true);
    const response = await axios.get("https://localhost:44396/api/users/retrieveUser/" + text);
    setLoading(false);
    console.log(response)
    setProfile(response.data)
  }

  const onSubmitRank = async (text) => {
    setLoading(true);
    const response = await axios.get("https://localhost:44396/api/projects/languagesRank?year=" + text);
    setLoading(false);
    setRank(response.data);
  }

  return (
    <div className="App container-fluid">
      <div className="row">
        <Menu onClickRepo={async () => {
          setToRender("PROJECTS_FOR_USER");
        }}
          onClickRank={async () => {
            setToRender("LANGUAGES_RANK");
          }}
          onClickProfile={async () => {
            setToRender("PROFILE");
          }}
          onClickGraph={async () => {
            console.log("oi")
            setToRender("GRAPH");
          }}>
        </Menu>
        {
          loading &&
          <div className="App-header col">
            <div class="lds-dual-ring"></div>
          </div>
        }
        {
          <div hidden={loading} className="App-header col">
            {
              (toRender == "PROJECTS_FOR_USER" &&
                <ProjectsForUser data={repos} onSubmit={onSubmitProjects} />
              )
              ||
              (toRender == "LANGUAGES_RANK" &&
                <Ranking onSubmit={onSubmitRank} data={rank}></Ranking>
              )
              ||
              (toRender == "PROFILE" &&
                <UserProfile onSubmit={onSubmitProfile} data={profile}></UserProfile>
              )
              ||
              (toRender == "GRAPH" &&
                <LineGraph data={graph} onSubmit={onSubmitGraph}></LineGraph>)

            }
          </div>}
      </div>
    </div>

  );
}

export default App;
