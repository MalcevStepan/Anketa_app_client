import { observer } from "mobx-react-lite";
import { useContext, useEffect, useMemo, useState } from "react";
import { Col, Container, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { Context } from "..";
import { fetchCathedras } from "../http/CathedraApi";
import { deleteMassiv } from "../http/MassivApi";
import { deleteReport } from "../http/ReportApi";
import { deleteResult, fetchOneResult } from "../http/ResultApi";
import { findUsers } from "../http/UserApi";
import trash from "./../imgs/trash_icon.svg";

const DeleteAnketa = observer(() => {
  const { cathedra } = useContext(Context);
  const { user } = useContext(Context);

  const [cathVal, setCathVal] = useState("");
  const [cathId, setCathId] = useState(0);

  const navigate = useNavigate();

  const [value, setValue] = useState("");

  const filteredUsers = useMemo(() => {
    return user.users.filter((us) => {
      return us.fullname.toLowerCase().includes(value.toLowerCase());
    });
  });

  useEffect(() => {
    fetchCathedras().then((data) => {
      cathedra.setCathedras(data);
    });
  }, []);

  useEffect(() => {
    if (cathVal) {
      cathedra.cathedras.forEach((cath) => {
        if (cath.name === cathVal) {
          setCathId(cath.id);
        }
      });
    }
  }, [cathVal]);

  useEffect(() => {
    if (cathId) {
      findUsers(cathId).then((data) => {
        user.setUsers(data);
      });
    }
  }, [cathId]);

  useEffect(() => {
    if (user.users && user.users.length) {
      user.users.forEach((us) => {
        fetchOneResult(us.id).then((data) => {
          user.setUsers([
            ...user.users.map((u) =>
              u.id === us.id
                ? { ...u, res: data.result, update: data.updatedAt}
                : { ...u }
            ),
          ]);
        });
      });
    }
  }, [user.users]);

  function DeleteFunc(id) {
    deleteResult(id).then(data => {
        console.log('result');
    })

    deleteReport(id).then(data => {
        console.log('report');
    })

    deleteMassiv(id).then(data => {
        console.log('massiv');
    })
    
  }

  return (
    <div className="filter" style={{ marginTop: "4rem" }}>
      <Container>
        <Row style={{ marginTop: "1rem" }}>
          <Col style={{ fontFamily: "Roboto" }} md={4}>
            Выберите кафедру:
          </Col>
          <Col md={8}>
            <select
              onChange={(e) => setCathVal(e.target.value)}
              value={cathVal}
              className="select"
            >
              <option value=""></option>
              {cathedra.cathedras.map((cath) => (
                <option key={cath.id} value={cath.name}>
                  {cath.name}
                </option>
              ))}
            </select>
          </Col>
        </Row>

        <div>
          <h4
            style={{
              textAlign: "center",
              marginTop: "3rem",
              marginBottom: "2rem",
            }}
          >
            Сотрудники
          </h4>

          {user.users && user.users.length ? (
            <Row>
              <Col md={4}>
                <input
                  placeholder="Поиск сотрудников..."
                  className="search"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  type="text"
                />
              </Col>
              <Col md={8}></Col>
            </Row>
          ) : (
            <></>
          )}


          {user.users && user.users.length ? (

           <>

            <Row style={{marginBottom: '1rem'}} className="blankHead" >
                <Col md={4}>ФИО</Col>
                <Col md={3}>Общий балл</Col>
                <Col md={4}>Дата последнего редактирования</Col>

            </Row>

            {filteredUsers.map((us) => (
              <Row className="us_item" key={us.id}>
                <Col md={4}>{us.fullname}</Col>
                <Col md={3}>{us.res}</Col>
                <Col md={4}>{us.update}</Col>
                <Col md={1}>
                  <img
                    style={{
                      height: "30px",
                      marginLeft: "30px",
                      cursor: "pointer",
                    }}
                    md={1}
                    src={trash}
                    alt=""
                  />
                </Col>
              </Row>
            ))}
           </>
          ) : (
            <div>Сотрудники не найдены!</div>
          )}
        </div>
      </Container>
    </div>
  );
});

export default DeleteAnketa;