import { observer } from "mobx-react-lite";
import { Row, Col, Button } from "react-bootstrap";
import { useContext, useState, useEffect } from "react";
import { Context } from "../index";
import { useMediaQuery } from 'react-responsive';
import Items from "./Items";
import { createTree2 } from "../functions";
import { fetchItems } from "../http/ItemApi";
import { fetchSelectsAll } from "../http/SelectApi";
import { fetchCathedras } from "../http/CathedraApi";
import { createResult } from "../http/ResultApi";
import { createReport } from "../http/ReportApi";
import { createMassiv } from "../http/MassivApi";
import { fetchOneUser, updateUser } from "../http/UserApi";

const Blank = observer( () => {
  const { item } = useContext(Context);
  const { cathedra } = useContext(Context);
  const { user } = useContext(Context);

  const [data, setData] = useState([]);

  const mobile = useMediaQuery({ query: '(max-width: 1400px)' })
  const mobile2 = useMediaQuery({ query: '(max-width: 410px)' })

  const [child, setChild] = useState('');
  const [parent, setParent] = useState('');

  const [name, setName] = useState('');
  const [localUser, setLocalUser] = useState({});
  const [cathValue, setCathValue] = useState('');
  const [cathId, setCathId] = useState(0);


  useEffect( () => {

    if(localStorage.getItem('data')) {
      item.setItems(JSON.parse(localStorage.getItem('data')));
    } else {
      fetchItems().then((data) => {
        item.setItems(createTree2([...data.map(d => d.parentId === null ? {...d, clas: true, clasName: false} : 
          d.children && d.children.length 
          ?  {...d, clas: false, clasName: false}
          :  {...d, clas: false}
         )]))
      })
    }

    if(localStorage.getItem('massiv')) {
      item.setMassiv(JSON.parse(localStorage.getItem('massiv')));
    }

    if(localStorage.getItem('stavka')) {
      item.setStavka(localStorage.getItem('stavka'));
    }

      setName(localStorage.getItem('name'));

   // setName(user.user.fullname);

   fetchOneUser(user.user.id).then(data => setName(data.fullname));

     fetchSelectsAll().then((data) => {
       item.setSelects(data);
     })

     fetchCathedras().then((data) => {
     cathedra.setCathedras(data);
    })

    fetchOneUser(user.user.id).then((data) => {
      setLocalUser(data);
    })
  }, [])

  const showFunc = async (id) => {
    item.setItems([...item.items.map(d => d.parentId === id 
      ? {...d, clas: !d.clas}
      :  d.id === id && d.children && d.children.length
      ? {...d, clasName: !d.clasName}
      : {...d}
      )]);
  }

  useEffect( () => {
   item.items.forEach( el => {
     item.items.forEach( el2 => {
       if( !el.clas && el2.num.includes(el.num) && el2.num.split('.').length === el.num.split('.').length + 1
       && el2.clas ) {
         setChild(el2.num);
         setParent(el.num);
       }
     })
   })
  }, [item.items])

  useEffect( () => {
   if(child && parent) {
    item.setItems([
      ...item.items.map((dat) =>
        dat.num === child ? { ...dat, clas: !dat.clas } : 
        dat.num === parent ? { ...dat, clasName: !dat.clasName } : 
        { ...dat }
      ),
    ]);
   }
  }, [child, parent])


  useEffect(() => {
    if(cathValue) {
      cathedra.cathedras.forEach(cath => {
        if(cath.name === cathValue) {
          setCathId(cath.id);
        }
      })
    }
  }, [cathValue])

  useEffect(() => {
    if(cathId) {
      setLocalUser({...localUser, cathedraId: cathId});
    }
  }, [cathId])


  function clearData() {
    
    if( localStorage.getItem('data')) {
      localStorage.removeItem('data');
    }
    if( localStorage.getItem('massiv')) {
      localStorage.removeItem('massiv');
    }
    if( localStorage.getItem('stavka')) {
      localStorage.removeItem('stavka');
    }
    window.location.reload();
  }

  function saveData() {
   localStorage.setItem('data', JSON.stringify(item.items));
   localStorage.setItem('massiv', JSON.stringify(item.massiv));
   localStorage.setItem('stavka', item.stavka);
   alert('Ваши данные сохранены!');
  }


  async function postAnketa() {
    try {
      let res;
      res = await createResult({ userId: user.user.id, result: item.sym });
      await item.items.forEach((d) => {
        createReport({
          selectvalue: d.select,
          value: d.vvod,
          ball_value: d.value,
          userId: user.user.id,
          itemId: d.id,
        }).then((dat) => {

          for (let key in item.massiv) {
            if (item.massiv.hasOwnProperty(key)) {
             if(d.id == key) {
              item.massiv[key].forEach(el2 => {
                createMassiv({value: el2.val, userId: user.user.id, itemId: d.id})
                .then(end => console.log('massiv'));
              })
             }
            
            }
          }
        });
      });

      updateUser(localUser.id, localUser);

      alert('Ваша анкета добавлена!');
      //window.location.reload();
    } catch (e) {
      alert(e.response.data.message);
    }
  }


  return (
    
      <div  className="blank" style={{ marginTop: "4rem" }}>
      <Row>
        <Col style={{ textAlign: "center", backgroundColor: "#e9eff9", borderRadius: '15px' }}>Ставка: {item.stavka} </Col>
        <Col style={{ textAlign: "center", backgroundColor: "#e9eff9", borderRadius: '15px' }}>Общий балл: {item.sym ? Number(item.sym) : ''} </Col>
      </Row>
      <Row className="row" style={{ marginTop: "1rem" }}>
        <Col md={6}>ФИО</Col>
        <Col md={6}>
          <input onChange={(e) => setName(e.target.value)} value={name ? name : ''} type="text" />
        </Col>
      </Row>
      <Row className="row" style={{ marginTop: "1rem" }}>
        <Col md={6}>Кафедра</Col>
        <Col md={6}>
          <select
          value={cathValue}
          onChange={(e) => setCathValue(e.target.value)}
          >
            <option value=""></option>
            
            {cathedra.cathedras.map(cath =>
              <option key={cath.id} value={cath.name}> {cath.name} </option>
              )}

          </select>
        </Col>
      </Row>
      <div
        style={{ marginTop: "2rem", marginBottom: "0.5rem" }}
        className="hr"
      ></div>
      
        <Row>
          <Col style={{ textAlign: "center" }} md={8} >
          Критерии
          </Col>
          <Col style={{ textAlign: "center" }} md={1} >
          Балл
          </Col>
          <Col style={{ textAlign: "center" }} md={2}>
          Значение
          </Col>
          <Col md={1} ></Col>
        </Row>
       
      <div style={{ marginTop: "0.5rem"}} className="hr"></div>

      <Items showFunc={showFunc} data={data} setData={setData} />
      
       <Row style={{marginTop: '3rem'}}>
          <Col lg={6}>
            <Button onClick={postAnketa} style={
             {fontFamily: "var(--bs-body-font-family)", fontWeight: '500', marginTop: '15px'}
          } variant="primary">
              Добавить анкету
            </Button>
          </Col>
          <Col lg={6}>
          <Button
          onClick={clearData}
           style={
            mobile
            ? {fontFamily: "var(--bs-body-font-family)", fontWeight: '500', marginTop: '15px'}
            : {fontFamily: "var(--bs-body-font-family)", fontWeight: '500', marginLeft: '35%', marginTop: '15px'}
          } variant="dark">
            Сброс данных анкеты
          </Button>
          <Button onClick={saveData} style={
            mobile2
            ? {fontFamily: "var(--bs-body-font-family)", fontWeight: '500', marginTop: '15px'}
            : {fontFamily: "var(--bs-body-font-family)", fontWeight: '500', marginLeft: '10px', marginTop: '15px'}
          } variant="primary">
            Сохранить анкету
          </Button>
          </Col>
       </Row>
      
    </div>
   
  );
});

export default Blank;