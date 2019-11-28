import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import axios from 'axios'
import Chart from 'chart.js'

function Menu({ onClickRepo, onClickRank, onClickProfile }) {
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
      <div className="Query-button" onClick={onClickProfile}>
        Buscar informações de um usuário
        <i className="fas fa-chevron-right"></i>
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

class LineChart extends React.Component {

  constructor(props) {
    super(props);
    this.myRef = React.createRef();
    this.state = {
      text: "",
    }
  }
  componentDidMount() {
    console.log(this.myRef.current);
    const ctx = this.myRef.current;
    const chart = new Chart(ctx, {
      // The type of chart we want to create
      type: 'line',

      // The data for our dataset
      data: {
        labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
        datasets: [{
          label: 'Top language',
          backgroundColor: 'rgb(255, 99, 132)',
          borderColor: 'rgb(255, 99, 132)',
          data: [0, 10, 5, 2, 20, 30, 45]
        }]
      },
      options: {}
    });
  }

  render() {
    return (
      <div>
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
        {<canvas hidden={true} ref={this.myRef} id="myChart"></canvas>}
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
    <form action="">
      <input className="FormInput" value={text} onChange={updateText} /><button onClick={onClick} className="FormButton" />
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

function App() {
  //const [data, setData] = useState([])
  const [rank, setRank] = useState([]);
  const [profile, setProfile] = useState([]);
  const [repos, setRepos] = useState([]);
  const [toRender, setToRender] = useState("");

  const onSubmitProjects = async (text) => {
    const response = await axios.get("https://localhost:44396/api/users/" + text + "/projects");
    setRepos(response.data.map(el => ({ ...el, key: el.id })))
  }

  const onSubmitProfile = async (text) => {
    const response = await axios.get("https://localhost:44396/api/users/retrieveUser/" + text);
    console.log(response)
    setProfile(response.data)
  }

  const onSubmitRank = async (text) => {
    //const response = await axios.get("https://localhost:44396/api/projects/languagesRank?year=" + text);
    //console.log(response);
    setRank([
      {
        projects_count: 1000,
        language: "C#"
      },
      {
        projects_count: 500,
        language: "JavaScript"
      }
    ])
    //setRank(response.data);
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
          }}>
        </Menu>
        <div className="App-header col">
          {
            (toRender == "PROJECTS_FOR_USER" &&
              <ProjectsForUser data={repos} onSubmit={onSubmitProjects} />
            )
            ||
            (toRender == "LANGUAGES_RANK" &&
              <LineChart onSubmit={onSubmitRank} data={rank}></LineChart>
            )
            ||
            (toRender == "PROFILE" &&
              <UserProfile onSubmit={onSubmitProfile} data={profile}></UserProfile>
            )

          }
        </div>
      </div>
    </div>

  );
}

export default App;
